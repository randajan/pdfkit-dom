
import { LoremIpsum } from "lorem-ipsum";

const lorem = new LoremIpsum();

export const generateInvoice = async gen => {

  const org = {
    name: "John Doe",
    in: "123456789",
    tin: "",
    street: "Ulice 123/4",
    city: "100 00 Praha",
    phone: "+420123456789",
    email: "email@example.com"
  };

  const partner = {
    name: "Jane Doe",
    in: "987654321",
    tin: "CZ987654321",
    street: "Ulice 4/321",
    city: "100 00 Praha",
    phone: "+420987654321",
    email: "email@example.com"
  };

  const rows = [];
  for (let i = 1; i <= 15; i++) {
    const row = [];
    for (let j = 1; j <= 4; j++) {
      row.push(gen.text(`${i}:${j} ${lorem.generateWords(Math.round(Number.jet.rnd(5, 11+(j*10)-(i/10))))}`.trim() + " END!!!", {
        font:8,
        align: "left bottom",
      }));
    }
    rows.push(row);
  }


  gen.header("PDFKit-dom demo header");
  gen.footer("PDFKit-dom demo footer");

  const contacts = gen.contacts("Subject1", "Subject2", org, partner).render();

  gen.grid(rows, {
    width: "max",
    height: "min",
    border: {
      horizontal:"1 gray",
      row:"1 lightgray 1",
      column:"1 #F4F4F4 1"
    },
    margin:"20 0 0 0",
    padding:1,
    grid:"1 2",
    paging:true
  }, {
    header:gen.grid([[
      gen.text("První sloupec", { align:"center", font:"10 bold" }),
      gen.text("Sloupec A", { align:"center", font:"10 bold" }),
      gen.text("Prostě sloupec", { align:"center", font:"10 bold" }),
      gen.text("Poslední sloupec", { align:"center", font:"10 bold" })
    ]]),
    footer:gen.text("seznam pokračuje na další straně", {align:"right", font:"7 regular italic", color:"#999"}),
  }).set({y:contacts.height}).render();


}
