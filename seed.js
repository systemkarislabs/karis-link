const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  // Cria tenant demo
  const tenant = await prisma.tenant.create({
    data: {
      name: 'Karis Link Demo',
      slug: 'demo',
      description: 'Empresa demonstração',
      adminUser: 'admin',
      adminPass: 'admin123',
      sellers: {
        create: [
          { name: 'Ana Silva',    whatsapp: '5511999990001', role: 'Consultora Senior', featured: true,  clicks: 42 },
          { name: 'Bruno Costa',  whatsapp: '5511999990002', role: 'Consultor',         featured: false, clicks: 28 },
          { name: 'Carla Mendes', whatsapp: '5511999990003', role: 'Consultora',        featured: false, clicks: 19 },
          { name: 'Diego Rocha',  whatsapp: '5511999990004', role: 'Consultor Junior',  featured: false, clicks: 11 },
          { name: 'Eva Lima',     whatsapp: '5511999990005', role: 'Consultora',        featured: false, clicks: 8  },
        ]
      }
    }
  });
  console.log(`✅ Tenant "${tenant.name}" criado: /${tenant.slug}`);
  console.log(`   Login: ${tenant.adminUser} / ${tenant.adminPass}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
