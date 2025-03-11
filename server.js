const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const ClienteDAO = require('./src/controller/ClienteDAO');
const Cliente = require('./src/model/Cliente');
const DepartamentoDAO = require('./src/controller/DepartamentoDAO');
const ProdutoDAO = require('./src/controller/ProdutoDAO');
const Produto = require('./src/model/Produto');
const VendaDAO = require('./src/controller/VendaDAO');
const Venda = require('./src/model/Venda');

const app = express();

// Configuração da pasta pública
app.use(express.static(__dirname + '/public'));
app.use(bodyParser.urlencoded({ extended: true }));

app.set('view engine', 'ejs');
app.set("views", __dirname + "\\src\\view");

app.use(session({
    secret: 'trabalhomuitofacil',
    resave: true,
    saveUninitialized: true
}));

// Rota inicial
app.get('/', function (req, res) {
    res.sendFile(__dirname + "/index.html");
});

// Rota para cadastrar cliente
app.post('/cadastrar', async function (req, res) {
    let cliente = new Cliente();
    let dao = new ClienteDAO();
    let botao = String(req.body.b1).trim();

    try {
        if (botao === "Cadastrar") {
            cliente.nome = req.body.txtNome;
            cliente.login = req.body.txtLogin;
            cliente.senha = req.body.txtSenha;
            
            let codigo = await dao.gravar(cliente);
            res.send("Cliente cadastrado com sucesso! Código: " + codigo);
        }
    } catch (erro) {
        console.log("Erro ao cadastrar cliente: " + erro);
        res.send("Erro ao cadastrar cliente.");
    }
});

// Rota para login
app.post("/login", async function (req, res) {
    let login = req.body.txtLogin;
    let senha = req.body.txtSenha;
    let dao = new ClienteDAO();
    
    try {
        const cliente = await dao.login(login, senha);
        if (cliente) {
            req.session.usuario = cliente;
            req.session.carrinho = [];  // Inicializa o carrinho na sessão
            res.send(cliente.nome + " logado com sucesso.");
        } else {
            req.session.usuario = null;
            res.send("Erro no login/senha");
        }
    } catch (erro) {
        console.log("Erro no login: " + erro);
        res.send("Erro ao tentar logar.");
    }
});

// Rota para exibir o carrinho
app.get('/carrinho', (req, res) => {
    // Inicializa o carrinho na sessão caso ainda não exista
    if (!req.session.carrinho) {
        req.session.carrinho = [];
    }

    const carrinho = req.session.carrinho;
    res.render('carrinho', { carrinho });
});


app.post('/removerdocarrinho', (req, res) => {
    const idProduto = parseInt(req.body.idProduto); // Obtém o ID do produto do formulário
    
    if (req.session.carrinho) {
        // Filtra o carrinho para remover o item com o ID correspondente
        req.session.carrinho = req.session.carrinho.filter(item => item.codigo !== idProduto);
    }
    
    res.redirect('/carrinho'); // Redireciona para o carrinho após a remoção
});

// Rota para adicionar ao carrinho
app.post('/comprar', (req, res) => {
    // Não é necessário verificar o login agora
    try {
        let obj = new Produto();
        obj.codigo = parseInt(req.body.txtCodigo);
        obj.descricao = String(req.body.txtDescricao);
        obj.preco = parseFloat(req.body.txtPreco);
        obj.qtde = parseInt(req.body.txtQtde);

        // Inicializa o carrinho, caso não exista
        if (!req.session.carrinho) {
            req.session.carrinho = [];
        }

        // Adiciona o produto ao carrinho
        req.session.carrinho.push(obj);

        res.redirect("/carrinho"); // Redireciona para o carrinho
    } catch (erro) {
        console.log("Erro ao adicionar item ao carrinho: " + erro);
        res.send("Erro ao adicionar item ao carrinho.");
    }
});


app.post('/finalizarCompra', async (req, res) => {
    if (!req.session.usuario || !req.session.carrinho || req.session.carrinho.length === 0) {
        return res.send("Você precisa estar logado e o carrinho não pode estar vazio.");
    }

    try {
        const carrinho = req.session.carrinho;
        let totalGeral = 0;
        const itensVenda = [];

        // Calcula o total da venda e prepara os itens
        carrinho.forEach(item => {
            const totalParcial = item.preco * item.qtde;
            totalGeral += totalParcial;
            itensVenda.push({
                id_produto: item.codigo,
                quantidade: item.qtde,
                preco: item.preco
            });
        });

        // Cria uma instância de venda
        let venda = {
            id_cliente: req.session.usuario.codigo,  // Assume que o código do cliente está na sessão
            total: totalGeral,
            data: new Date(),  // Data atual
            itens: itensVenda
        };

        // Cria o DAO de Venda e grava a venda no banco de dados
        let vendaDAO = new VendaDAO();
        let vendaId = await vendaDAO.gravar(venda);

        // Limpa o carrinho após finalizar a compra
        req.session.carrinho = [];

        res.send(`Compra finalizada com sucesso! Venda: ${vendaId}`);
    } catch (erro) {
        console.log("Erro ao finalizar compra: " + erro);
        res.send("Erro ao finalizar compra.");
    }
});




// Rota para listar produtos
app.get("/listarProduto", async (req, res) => {
    let dao = new DepartamentoDAO();
    let tabela = await dao.listar();
    res.render('departamento', { tabela });
});

// Rota para listar produtos por departamento
app.get('/listarProduto/:codigo', async (req, res) => {
    try {
        let codigo = parseInt(req.params.codigo);
        let dao = new ProdutoDAO();
        let tabela = await dao.listar(codigo);
        res.render("produto", { tabela });
    } catch (erro) {
        console.log("Erro ao listar produtos: " + erro);
    }
});

// Inicia o servidor
app.listen(3000, function (erro) {
    if (erro) {
        console.log("Erro no servidor: " + erro);
    } else {
        console.log("Servidor rodando na porta 3000");
    }
});
