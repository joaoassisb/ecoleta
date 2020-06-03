import Knex from "knex";

export async function seed(knex: Knex) {
  return knex("items").insert([
    {
      name: "Lâmpadas",
      image: "lampadas.svg",
    },
    {
      name: "Pilhas e baterias",
      image: "baterias.svg",
    },
    {
      name: "Papéis e papelão",
      image: "papeis-papelao.svg",
    },
    {
      name: "Resíduos eletrônicos",
      image: "eletronicos.svg",
    },
    {
      name: "Resíduos orgânicos",
      image: "organicos.svg",
    },
    {
      name: "Óleo de cozinha",
      image: "oleo.svg",
    },
  ]);
}
