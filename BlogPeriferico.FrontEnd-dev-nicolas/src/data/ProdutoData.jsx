export const ProdutoData = Array(27).fill(null).map((_, index) => {
  const base = [
    {
      id: 1,
      titulo: "Nintendo Switch usado",
      resumo: "Switch desbloqueado com jogos grátis.",
      descricaoCompleta: "O Nintendo Switch Desbloqueado na versão Oled Pode Baixar Todos Os Jogos Completos de Graça isso mesmo de Graça! É a melhor escolha para jogadores que procuram uma experiência imersiva e portátil, com tela de alta resolução, recursos avançados e bateria de longa duração.",
      imagem: "https://i.pinimg.com/736x/72/6d/49/726d490e062376471b3f41466facf922.jpg",
      preco: "789,50",
      autor: "João Vendedor",
      fotoAutor: "https://i.pinimg.com/736x/c4/66/90/c466907bfa75c5598d6a193a589531a4.jpg",
      data: "17/06/25",
      hora: "15:30",
      regiao: "Sudeste",
      telefone: "11953716330",
      comentarios: [
        {
          nome: "Rihanna Josephine",
          avatar: "https://i.pravatar.cc/80?img=32",
          hora: "19h",
          texto: "Comprei e não me arrependo muito bom",
        },
        {
          nome: "Sophey Paul",
          avatar: "https://i.pravatar.cc/80?img=12",
          hora: "10h",
          texto:
            "Vendedor muito confiável, entregou na mesma semana. Compraria de novo!",
        },
        {
          nome: "John Selese",
          avatar: "https://i.pravatar.cc/80?img=7",
          hora: "10h",
          texto: "Golpista cuidado",
        },
      ],
    },
    {
      id: 2,
      titulo: "Fone JBL Bluetooth Original",
      resumo: "Fone com cancelamento de ruído e som potente.",
      descricaoCompleta: "Fone de ouvido JBL Tune 510BT com tecnologia Pure Bass. Bateria com até 40h de duração, carregamento rápido e conexão sem fio estável. Confortável para uso prolongado e compatível com assistente de voz.",
      imagem: "https://i.pinimg.com/736x/b6/50/e2/b650e2db9d86b9476094f38164db1e46.jpg",
      preco: "199,90",
      autor: "Larissa Audio",
      fotoAutor: "https://i.pinimg.com/736x/df/56/32/df5632a9d872870bb00383c84a102308.jpg",
      data: "17/06/25",
      hora: "11:45",
      regiao: "Norte",
      telefone: "11987654321",
      comentarios: [
        {
          nome: "Lucas M.",
          avatar: "https://i.pravatar.cc/80?img=5",
          hora: "12h",
          texto: "O som é muito bom mesmo! Recomendo!",
        },
        {
          nome: "Beatriz Souza",
          avatar: "https://i.pravatar.cc/80?img=30",
          hora: "13h",
          texto: "Produto chegou certinho e bem embalado.",
        }
      ]
    },    
    {
      id: 4,
      titulo: "Tênis Nike Air Max Masculino",
      resumo: "Confortável, leve e estiloso. Tamanho 40.",
      descricaoCompleta: "Tênis Nike Air Max com solado amortecido, ideal para caminhadas, corridas leves e uso diário. Modelo 2024, na cor preta com detalhes em branco. Excelente estado de conservação, usado poucas vezes.",
      imagem: "https://i.pinimg.com/736x/fe/60/25/fe60258797232f3843ab3c014eeccce3.jpg",
      preco: "329,99",
      autor: "Pedro Calçados",
      fotoAutor: "https://i.pinimg.com/736x/cc/19/b5/cc19b5d80e0745d3fceae276ab855893.jpg",
      data: "15/06/25",
      hora: "17:20",
      regiao: "Leste",
      telefone: "11999887766",
      comentarios: [
        {
          nome: "Diego Lima",
          avatar: "https://i.pravatar.cc/80?img=16",
          hora: "20h",
          texto: "Tênis chegou novinho, muito confortável.",
        },
        {
          nome: "Fernanda Dias",
          avatar: "https://i.pravatar.cc/80?img=10",
          hora: "18h",
          texto: "Valeu cada centavo!",
        }
      ]
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
