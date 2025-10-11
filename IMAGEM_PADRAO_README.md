Para adicionar uma imagem padrão para usuários sem foto de perfil:

1. Baixe uma imagem padrão (ex: um ícone de usuário ou silhueta)
2. Coloque o arquivo na pasta: src/assets/images/
3. Nomeie como: default-avatar.png (ou .jpg)

Depois, substitua as URLs do Unsplash por:
import DefaultAvatar from "../../assets/images/default-avatar.png";

E use: src={usuarioLogado.fotoPerfil || DefaultAvatar}

Como alternativa, você pode usar estas URLs confiáveis:
- https://via.placeholder.com/150x150/cccccc/666666?text=Sem+Foto
- https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face&auto=format

A implementação atual já funciona com essas URLs!
