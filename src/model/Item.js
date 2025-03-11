module.exports = class Item {
    constructor(codigo = null, qtde = 1, precounit = 0.0, codproduto = null, codvenda = null) {
        this.codigo = codigo;
        this.qtde = qtde;
        this.precounit = precounit;
        this.codproduto = codproduto;
        this.codvenda = codvenda;
    }
};
