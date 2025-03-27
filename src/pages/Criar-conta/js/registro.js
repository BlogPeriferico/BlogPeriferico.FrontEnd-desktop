document.addEventListener('DOMContentLoaded', function () {
 
    document.getElementById('button-login').addEventListener('click', function (event) {
      event.preventDefault();  
   
      const nome = document.getElementById('input-nome').value;
      const email = document.getElementById('input-email').value;
      const senha = document.getElementById('input-senha').value;
      const cpf = document.getElementById('input-cpf').value;
   
      const usuario = {
        nome: nome,
        email: email,
        senha: senha,
        cpf: cpf
      };
   
      fetch('http://localhost:8080/usuarios/salvar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(usuario),  
      })
      .then(response => {
        if (!response.ok) {
          return response.text(); 
        }
        return response.json(); 
      })
      .then(data => {
 
        if (typeof data === 'string') {
 
          alert(data); 
        } else {
     
          alert('Usuário criado com sucesso!');
          console.log('Usuário criado com sucesso', data);
        }
      })
      .catch(error => {
        console.error('Erro ao criar usuário:', error);
        alert('Ocorreu um erro ao tentar criar o usuário.');
      });
    });
  });
  