// Importa para interação com o DB
const mongoose = require("mongoose");

// Permite criar esquemas e modelos para o MongoDB
const Schema = mongoose.Schema;

// Definindo um Schema para as Imagens
const PictureSchema = new Schema({
  // Campo do tipo String e obrigatório
  name: { type: String, required: true },
  // Campo para armazenar a imagem como Buffer
  image: { type: Buffer, required: true },
  // Campo para armazenar o tipo de conteúdo da imagem
  contentType: { type: String, required: true },
});

// Criando o modelo 'Picture' a partir do esquema criado antes
// O Modelo 'Picture' é usado para interagir com a "Tabela" Picture no DB
module.exports = mongoose.model("Picture", PictureSchema);
