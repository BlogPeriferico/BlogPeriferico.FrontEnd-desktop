export const ProdutoData = Array(27).fill(null).map((_, index) => {
  const base = [
    {
      titulo: "Sony DSCHX8",
      descricao: "Sony DSCHX8 High Zoom Point & Shoot Camera",
      preco: 1000,
      desconto: "40% OFF",
      imagem: "https://i.pinimg.com/736x/14/ff/fc/14fffc78043d44cfb3e38c6c7d904451.jpg",
    },
    {
      titulo: "Xiaomi True Wireless Earbuds",
      descricao: "Escape the noise, It's time to hear the magic with Xiaomi Earbuds.",
      preco: 300,
      desconto: "20% OFF",
      imagem: "https://i.pinimg.com/736x/01/42/ff/0142ff033d7c91888ecd47a2caf90256.jpg",
    },
    {
      titulo: "Tênis HRX Hrithik Roshan",
      descricao: "Novo lançamento de tenis HRX Hrithik Roshan na cor vermelha chegou a venda",
      preco: 600,
      desconto: "35% OFF",
      imagem: "https://i.pinimg.com/736x/b9/66/75/b96675136a01dcce62bdb706dc26abf1.jpg",
    },
  ];

  const item = base[index % 3];
  return {
    id: index + 1,
    ...item,
    telefone: "11953716330",
    usuario: "Vitor Hugo Aguiar de Paiva",
    tempo: "19h",
  };
});
