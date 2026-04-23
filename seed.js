/* eslint-disable @typescript-eslint/no-require-imports */
const bcrypt = require('bcryptjs');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const adminPass = 'admin123';

  const tenant = await prisma.tenant.create({
    data: {
      name: 'Karis Link Demo',
      slug: 'demo',
      adminUser: 'admin',
      adminPass: await bcrypt.hash(adminPass, 12),
      sellers: {
        create: [
          { name: 'Ana Silva', phone: '5511999990001', clicks: 42 },
          { name: 'Bruno Costa', phone: '5511999990002', clicks: 28 },
          { name: 'Carla Mendes', phone: '5511999990003', clicks: 19 },
          { name: 'Diego Rocha', phone: '5511999990004', clicks: 11 },
          { name: 'Eva Lima', phone: '5511999990005', clicks: 8 },
        ],
      },
    },
  });

  console.log(`Tenant "${tenant.name}" criado: /${tenant.slug}`);
  console.log(`Login inicial: ${tenant.adminUser} / ${adminPass}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
