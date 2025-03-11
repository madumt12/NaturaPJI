class Venda {
    constructor(id_cliente, total) {
        this.id_cliente = id_cliente;  // ID do cliente
        this.total = total;  // Total da venda
        this.itens = [];  // Array para armazenar os itens da venda
    }

    // Método para adicionar itens à venda
    adicionarItem(id_produto, quantidade, preco) {
        this.itens.push({ id_produto, quantidade, preco });  // Adiciona um item à lista
    }
}

module.exports = Venda;
