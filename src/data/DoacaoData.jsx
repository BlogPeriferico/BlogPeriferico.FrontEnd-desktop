export const DoacaoData = Array(27).fill(null).map((_, index) => {
    const base = [
        {
          id: 1,
          titulo: "Roupas infantis para doação",
          descricao: "Conjunto de roupas para crianças de 3 a 6 anos, bem conservadas. Inclui camisetas, calças e jaquetas.",
          imagem: "https://i.pinimg.com/736x/57/d1/39/57d1393cc2f0e86cae9ef094bc455c2f.jpg",
          autor: "Carla Fernandes",
          fotoAutor: "https://i.pravatar.cc/150?img=20",
          regiao: "Leste",
          telefone: "11987654321",
          data: "17/06/25",
          hora: "14:00",
          comentarios: [
            {
              nome: "Luciana Alves",
              avatar: "https://i.pravatar.cc/80?img=33",
              hora: "15h",
              texto: "Gostaria de buscar amanhã, ainda está disponível?",
            }
          ]
        },
        {
          id: 2,
          titulo: "Livros de ensino médio",
          descricao: "Apostilas e livros didáticos de todas as matérias do ensino médio. Em bom estado, ideal para estudos e vestibular.",
          imagem: "https://i.pinimg.com/736x/2b/3f/a5/2b3fa5e4f36fb20611b1ae3c80cf4966.jpg",
          autor: "Eduardo Campos",
          fotoAutor: "https://i.pravatar.cc/150?img=14",
          regiao: "Norte",
          telefone: "11999887766",
          data: "17/06/25",
          hora: "09:15",
          comentarios: []
        },
        {
          id: 3,
          titulo: "Colchão de solteiro usado",
          descricao: "Colchão usado mas firme, sem rasgos. Ideal para alguém que precise com urgência.",
          imagem: "https://i.pinimg.com/736x/fc/7d/6b/fc7d6b16d6ca67f92f14642442727419.jpg",
          autor: "Mariana Silva",
          fotoAutor: "https://i.pravatar.cc/150?img=8",
          regiao: "Oeste",
          telefone: "11993458276",
          data: "16/06/25",
          hora: "20:50",
          comentarios: [
            {
              nome: "Rogério Lima",
              avatar: "https://i.pravatar.cc/80?img=6",
              hora: "21h",
              texto: "Olá! Consigo buscar hoje ainda?",
            }
          ]
        },
        {
          id: 4,
          titulo: "Carrinho de bebê",
          descricao: "Carrinho de bebê usado com alguns sinais de uso. Estrutura está ótima, dobrável e fácil de transportar.",
          imagem: "https://i.pinimg.com/736x/ef/d9/f3/efd9f3a03db7792c509ae821fe9c5a57.jpg",
          autor: "Tiago Mendes",
          fotoAutor: "https://i.pravatar.cc/150?img=2",
          regiao: "Sul",
          telefone: "11991234567",
          data: "15/06/25",
          hora: "16:40",
          comentarios: [
            {
              nome: "Paula M.",
              avatar: "https://i.pravatar.cc/80?img=17",
              hora: "17h",
              texto: "Tenho interesse, ainda está disponível?",
            }
          ]
        }
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
  


