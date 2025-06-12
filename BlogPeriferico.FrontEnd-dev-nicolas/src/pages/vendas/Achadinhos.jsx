import CarrosselVendas from "../../components/carrossels/CarrosselVendas";
import SelecaoAnuncios from "../../components/selecoes/SelecaoAnuncios";

export default function Vendas() {
  return (
    <div className="max-w-6xl mx-auto pt-24 px-6">
      <CarrosselVendas />
      <SelecaoAnuncios />
    </div>
  );
}
