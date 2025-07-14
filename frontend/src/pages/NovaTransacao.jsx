import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { categoriasReceita, categoriasDespesa } from "../data/categorias";
import dayjs from "dayjs"; // Adicione esta linha para importar o dayjs


const NovaTransacao = () => {
  const [dados, setDados] = useState({
    descricao: "",
    valor: "",
    tipo: "despesa",
    categoria: "",
    data: dayjs().format("YYYY-MM-DD"),
  });
  const [categoriasDinamicas, setCategoriasDinamicas] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // 🔄 Atualiza categorias ao mudar o tipo
  useEffect(() => {
    const fetchCategorias = async () => {
      const token = localStorage.getItem("token");
      try {
        const response = await api.get(`/categorias/${dados.tipo}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setCategoriasDinamicas(response.data);
      } catch (error) {
        console.error("Erro ao carregar categorias:", error);
        setCategoriasDinamicas([]);
      }
    };

    fetchCategorias();
  }, [dados.tipo]);

  const handleChange = (e) => {
    setDados({ ...dados, [e.target.name]: e.target.value });
    // Limpa mensagens quando o usuário edita
    if (successMessage || errorMessage) {
      setSuccessMessage("");
      setErrorMessage("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage("");
    setSuccessMessage("");
    
    const token = localStorage.getItem("token");

    try {
      await api.post("/transactions", dados, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      setSuccessMessage("Transação cadastrada com sucesso!");
      // Limpa o formulário mas mantém o tipo selecionado
      setDados({
        descricao: "",
        valor: "",
        tipo: dados.tipo,
        categoria: "",
        data: dayjs().format("YYYY-MM-DD"),
      });
    } catch (error) {
      console.error("Erro ao salvar transação:", error);
      setErrorMessage(
        error.response?.data?.message || 
        "Erro ao salvar transação. Verifique os dados e tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const categorias =
    dados.tipo === "receita" ? categoriasReceita : categoriasDespesa;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Nova Transação</h1>
            <p className="text-sm text-gray-600">Preencha os dados da transação</p>
          </div>
          <button
            onClick={() => navigate("/dashboard")}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Voltar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Mensagens de feedback */}
          {successMessage && (
            <div className="p-3 bg-green-100 text-green-700 rounded-md">
              {successMessage}
            </div>
          )}
          {errorMessage && (
            <div className="p-3 bg-red-100 text-red-700 rounded-md">
              {errorMessage}
            </div>
          )}

          {/* Campo Descrição */}
          <div>
            <label htmlFor="descricao" className="block text-sm font-medium text-gray-700 mb-1">
              Descrição (Opcional)
            </label>
            <input
              type="text"
              id="descricao"
              name="descricao"
              placeholder="Ex: Salário, Aluguel, Supermercado"
              value={dados.descricao}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Campo Valor */}
          <div>
            <label htmlFor="valor" className="block text-sm font-medium text-gray-700 mb-1">
              Valor *
            </label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500">R$</span>
              </div>
              <input
                type="number"
                id="valor"
                name="valor"
                placeholder="0,00"
                value={dados.valor}
                onChange={handleChange}
                required
                step="0.01"
                min="0.01"
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Campo Tipo */}
          <div>
            <label htmlFor="tipo" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setDados({...dados, tipo: "receita"})}
                className={`py-2 px-4 rounded-md border transition-colors ${dados.tipo === "receita" ? 'bg-green-100 border-green-500 text-green-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Receita
              </button>
              <button
                type="button"
                onClick={() => setDados({...dados, tipo: "despesa"})}
                className={`py-2 px-4 rounded-md border transition-colors ${dados.tipo === "despesa" ? 'bg-red-100 border-red-500 text-red-700' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'}`}
              >
                Despesa
              </button>
            </div>
          </div>

          {/* Campo Categoria */}
          <div>
            <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
              Categoria *
            </label>
            <input
              type="text"
              id="categoria"
              name="categoria"
              placeholder="Selecione ou digite uma categoria"
              list="categorias-list"
              value={dados.categoria}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <datalist id="categorias-list">
              {categorias.map((cat, idx) => (
                <option key={idx} value={cat} />
              ))}
            </datalist>
          </div>

          {/* Campo Data */}
          <div>
            <label htmlFor="data" className="block text-sm font-medium text-gray-700 mb-1">
              Data *
            </label>
            <input
              type="date"
              id="data"
              name="data"
              value={dados.data}
              onChange={handleChange}
              required
              className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Botões de ação */}
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={() => navigate("/dashboard")}
              className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-4 py-2 border border-transparent rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Salvando...
                </>
              ) : 'Salvar Transação'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NovaTransacao;