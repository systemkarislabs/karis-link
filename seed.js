const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const sellers = [
    { name: 'João Mendes', whatsapp: '5511988887777', photoUrl: 'https://i.pravatar.cc/150?img=11', active: true, clicks: 120 },
    { name: 'Mariana Costa', whatsapp: '5511977776666', photoUrl: 'https://i.pravatar.cc/150?img=5', active: true, clicks: 85 },
    { name: 'Lucas Oliveira', whatsapp: '5511966665555', photoUrl: 'https://i.pravatar.cc/150?img=12', active: true, clicks: 210 },
    { name: 'Fernanda Lima', whatsapp: '5511955554444', photoUrl: 'https://i.pravatar.cc/150?img=9', active: true, clicks: 45 },
    { name: 'Rafael Souza', whatsapp: '5511944443333', photoUrl: 'https://i.pravatar.cc/150?img=13', active: true, clicks: 160 }
  ];

  for (const seller of sellers) {
    await prisma.seller.create({
      data: seller
    });
  }
  
  console.log('5 vendedores criados com sucesso!');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
