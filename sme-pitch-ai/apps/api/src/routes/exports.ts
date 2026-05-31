import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { authMiddleware } from '../middleware/auth';
import { uploadToS3, getSignedDownloadUrl } from '../lib/s3';
import { generateDocx, generatePptx } from '../services/exportService';
import { calculateFinancialModel } from '../services/financialService';
import { FinancialModelInputsSchema } from '@sme-pitch-ai/shared';
import ExcelJS from 'exceljs';

const router = Router();
router.use(authMiddleware);

router.get('/document/:id/:format', async (req, res, next) => {
  try {
    const format = z.enum(['DOCX', 'PDF', 'PPTX']).parse(req.params.format.toUpperCase());
    const document = await prisma.document.findFirst({
      where: { id: req.params.id, deletedAt: null },
      include: { profile: { include: { workspace: true } } },
    });
    if (!document) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Document not found' } }); return; }

    const isPaid = document.profile.workspace.planTier !== 'FREE';
    const key = `exports/${document.id}/${format.toLowerCase()}-v${document.version}-${Date.now()}`;

    let buffer: Buffer;
    let contentType: string;

    if (format === 'DOCX') {
      buffer = await generateDocx(document.content as Record<string, unknown>, !isPaid);
      contentType = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    } else if (format === 'PPTX') {
      buffer = await generatePptx(document.content as Record<string, unknown>);
      contentType = 'application/vnd.openxmlformats-officedocument.presentationml.presentation';
    } else {
      res.status(400).json({ error: { code: 'NOT_SUPPORTED', message: 'PDF export requires paid plan' } });
      return;
    }

    await uploadToS3(key, buffer, contentType);
    const expiresAt = new Date(Date.now() + 3600 * 1000);
    await prisma.documentExport.create({ data: { documentId: document.id, format, s3Key: key, expiresAt } });

    const url = await getSignedDownloadUrl(key);
    res.json({ url, expiresAt });
  } catch (err) { next(err); }
});

router.get('/financial/:id', async (req, res, next) => {
  try {
    const model = await prisma.financialModel.findUnique({ where: { id: req.params.id } });
    if (!model) { res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Financial model not found' } }); return; }

    const inputs = FinancialModelInputsSchema.parse(model.revenueInputs);
    const outputs = calculateFinancialModel(inputs);

    const workbook = new ExcelJS.Workbook();
    workbook.creator = 'AElevate Business Innovations';

    const navyFill: ExcelJS.Fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF1A2744' } };
    const headerFont: Partial<ExcelJS.Font> = { bold: true, color: { argb: 'FFFFFFFF' }, name: 'Calibri' };

    const overview = workbook.addWorksheet('Overview');
    overview.addRow(['AElevate SME Financial Model']).font = { bold: true, size: 16, name: 'Calibri' };
    overview.addRow([]);
    overview.addRow(['Metric', 'Year 1', 'Year 2', 'Year 3']);
    overview.getRow(3).eachCell(cell => { cell.fill = navyFill; cell.font = headerFont; });
    outputs.annual.forEach(yr => {
      overview.addRow([`Year ${yr.year} Revenue`, yr.revenue.toFixed(2), '', '']);
    });

    const revenueSheet = workbook.addWorksheet('Revenue');
    revenueSheet.addRow(['Month', 'Revenue', 'COGS', 'Gross Profit']).eachCell(cell => { cell.fill = navyFill; cell.font = headerFont; });
    outputs.monthly.forEach(m => revenueSheet.addRow([m.month, m.revenue, m.cogs, m.grossProfit]));

    const costsSheet = workbook.addWorksheet('Costs');
    costsSheet.addRow(['Month', 'Operating Expenses', 'Loan Repayment', 'Total Costs']).eachCell(cell => { cell.fill = navyFill; cell.font = headerFont; });
    outputs.monthly.forEach(m => costsSheet.addRow([m.month, m.operatingExpenses, m.loanRepayment, m.operatingExpenses + m.loanRepayment]));

    const plSheet = workbook.addWorksheet('P&L');
    plSheet.addRow(['Month', 'Revenue', 'Gross Profit', 'EBITDA', 'Net Profit']).eachCell(cell => { cell.fill = navyFill; cell.font = headerFont; });
    outputs.monthly.forEach(m => plSheet.addRow([m.month, m.revenue, m.grossProfit, m.ebitda, m.netProfit]));

    const cfSheet = workbook.addWorksheet('Cash Flow');
    cfSheet.addRow(['Month', 'Inflow', 'Outflow', 'Net Cash Flow', 'Cumulative']).eachCell(cell => { cell.fill = navyFill; cell.font = headerFont; });
    outputs.monthly.forEach((m) => {
      const row = cfSheet.addRow([m.month, m.cashInflow, m.cashOutflow, m.netCashFlow, m.cumulativeCash]);
      if (m.isNegativeCash) {
        row.eachCell(cell => { cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE0E0' } }; });
      }
    });

    const buffer = Buffer.from(await workbook.xlsx.writeBuffer());
    const key = `exports/financial/${model.id}-${Date.now()}.xlsx`;
    await uploadToS3(key, buffer, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    await prisma.financialModel.update({ where: { id: model.id }, data: { s3Key: key } });
    const url = await getSignedDownloadUrl(key);
    res.json({ url });
  } catch (err) { next(err); }
});

export default router;
