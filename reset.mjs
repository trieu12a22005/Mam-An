import { PrismaClient } from '../Garden-BE/src/generated/prisma/index.js';

const prisma = new PrismaClient();

async function main() {
  try {
    const delCare = await prisma.careTaskLog.deleteMany({});
    console.log(`Đã xóa ${delCare.count} nhật ký chăm sóc.`);

    const del = await prisma.virtualPlant.deleteMany({});
    console.log(`Đã xóa ${del.count} cây ảo.`);

    const update = await prisma.realPlant.updateMany({
      data: { isAssigned: false, status: 'SEED' }
    });
    console.log(`Đã reset ${update.count} cây thật về trạng thái hạt giống.`);
  } catch (error) {
    console.error('Lỗi khi xóa:', error);
  } finally {
    process.exit(0);
  }
}

main();
