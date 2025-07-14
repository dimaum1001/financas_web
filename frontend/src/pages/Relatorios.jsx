import React, { useEffect, useState } from "react";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from "recharts";
import dayjs from "dayjs";

const Relatorios = () => {
  const [transacoes, setTransacoes] = useState([]);
  const [filtroAno, setFiltroAno] = useState(dayjs().year());
  const [filtroMes, setFiltroMes] = useState(dayjs().month() + 1);
  const [filtroCategoria, setFiltroCategoria] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const carregar = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await api.get("/transactions", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setTransacoes(response.data);
      } catch (err) {
        console.error("Erro ao carregar transações:", err);
      } finally {
        setIsLoading(false);
      }
    };
    carregar();
  }, []);

  const transacoesFiltradas = transacoes.filter((t) => {
    const data = dayjs(t.data);
    const categoriaValida = filtroCategoria === "" || t.categoria === filtroCategoria;
    return (
      data.year() === parseInt(filtroAno) &&
      data.month() + 1 === parseInt(filtroMes) &&
      categoriaValida
    );
  });

  const receitas = transacoesFiltradas.filter((t) => t.tipo === "receita");
  const despesas = transacoesFiltradas.filter((t) => t.tipo === "despesa");

  const totalReceitas = receitas.reduce((acc, t) => acc + t.valor, 0);
  const totalDespesas = despesas.reduce((acc, t) => acc + t.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  const dadosCategoria = [];
  const categoriasMap = {};
  despesas.forEach((t) => {
    if (!categoriasMap[t.categoria]) {
      categoriasMap[t.categoria] = 0;
    }
    categoriasMap[t.categoria] += t.valor;
  });
  for (let cat in categoriasMap) {
    dadosCategoria.push({ name: cat, value: categoriasMap[cat] });
  }

  const receitasPorCategoria = [];
  const receitaMap = {};
  receitas.forEach((t) => {
    if (!receitaMap[t.categoria]) {
      receitaMap[t.categoria] = 0;
    }
    receitaMap[t.categoria] += t.valor;
  });
  for (let cat in receitaMap) {
    receitasPorCategoria.push({ name: cat, value: receitaMap[cat] });
  }

  const dadosMensais = [];
  for (let i = 0; i < 12; i++) {
    const receitasMes = transacoes.filter(
      (t) => t.tipo === "receita" && dayjs(t.data).month() === i && dayjs(t.data).year() === parseInt(filtroAno)
    ).reduce((acc, t) => acc + t.valor, 0);

    const despesasMes = transacoes.filter(
      (t) => t.tipo === "despesa" && dayjs(t.data).month() === i && dayjs(t.data).year() === parseInt(filtroAno)
    ).reduce((acc, t) => acc + t.valor, 0);

    dadosMensais.push({
      mes: dayjs().month(i).format("MMM"),
      Receitas: receitasMes,
      Despesas: despesasMes,
    });
  }

  const rankingDespesasAno = Object.entries(
    transacoes.filter((t) => t.tipo === "despesa" && dayjs(t.data).year() === parseInt(filtroAno))
      .reduce((acc, t) => {
        acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
        return acc;
      }, {})
  ).map(([cat, value]) => ({ name: cat, value }));

  const rankingReceitasAno = Object.entries(
    transacoes.filter((t) => t.tipo === "receita" && dayjs(t.data).year() === parseInt(filtroAno))
      .reduce((acc, t) => {
        acc[t.categoria] = (acc[t.categoria] || 0) + t.valor;
        return acc;
      }, {})
  ).map(([cat, value]) => ({ name: cat, value }));

  const CORES_PRIMARIAS = {
    receita: "#16a34a",
    despesa: "#dc2626",
    saldo: "#2563eb",
    background: "#f8fafc",
    card: "#ffffff",
    borda: "#e2e8f0",
    texto: "#1e293b"
  };

  const coresGrafico = [
    "#8884d8", "#82ca9d", "#ffc658", "#ff8042", 
    "#8dd1e1", "#a4de6c", "#d0ed57", "#83a6ed"
  ];

  const categoriasUnicas = [...new Set(transacoes.map((t) => t.categoria))].sort();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Relatórios Financeiros</h1>
            <p className="text-gray-600">Análise detalhada das suas transações</p>
          </div>
          <button
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow transition-colors duration-200 flex items-center gap-2 mt-4 md:mt-0"
            onClick={() => navigate("/dashboard")}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Voltar ao Dashboard
          </button>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Filtros</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Mês</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={filtroMes}
                onChange={(e) => setFiltroMes(e.target.value)}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <option key={i + 1} value={i + 1}>
                    {dayjs().month(i).format("MMMM")}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Ano</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={filtroAno}
                onChange={(e) => setFiltroAno(e.target.value)}
              >
                {[2023, 2024, 2025, 2026].map((ano) => (
                  <option key={ano} value={ano}>{ano}</option>
                ))}
              </select>
            </div>
            
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoria</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                value={filtroCategoria}
                onChange={(e) => setFiltroCategoria(e.target.value)}
              >
                <option value="">Todas as Categorias</option>
                {categoriasUnicas.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Resumo Financeiro */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700">Receitas</h3>
              <div className="p-2 rounded-full bg-green-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-900">R$ {totalReceitas.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">No período selecionado</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700">Despesas</h3>
              <div className="p-2 rounded-full bg-red-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                </svg>
              </div>
            </div>
            <p className="text-2xl font-bold mt-2 text-gray-900">R$ {totalDespesas.toFixed(2)}</p>
            <p className="text-sm text-gray-500 mt-1">No período selecionado</p>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-medium text-gray-700">Saldo</h3>
              <div className="p-2 rounded-full bg-blue-100">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
            </div>
            <p className={`text-2xl font-bold mt-2 ${saldo >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              R$ {saldo.toFixed(2)}
            </p>
            <p className="text-sm text-gray-500 mt-1">No período selecionado</p>
          </div>
        </div>

        {/* Gráficos de Categorias */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Despesas</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={dadosCategoria} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80}
                    innerRadius={40}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {dadosCategoria.map((_, index) => (
                      <Cell key={index} fill={coresGrafico[index % coresGrafico.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ paddingLeft: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Distribuição de Receitas</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie 
                    data={receitasPorCategoria} 
                    dataKey="value" 
                    nameKey="name" 
                    cx="50%" 
                    cy="50%" 
                    outerRadius={80}
                    innerRadius={40}
                    label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                    labelLine={false}
                  >
                    {receitasPorCategoria.map((_, index) => (
                      <Cell key={index} fill={coresGrafico[index % coresGrafico.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                  />
                  <Legend 
                    layout="vertical" 
                    verticalAlign="middle" 
                    align="right"
                    wrapperStyle={{ paddingLeft: '20px' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Fluxo Mensal */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Fluxo Mensal - {filtroAno}</h3>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosMensais}>
                <XAxis dataKey="mes" />
                <YAxis />
                <Tooltip 
                  formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                />
                <Legend />
                <Bar 
                  dataKey="Receitas" 
                  fill={CORES_PRIMARIAS.receita} 
                  radius={[4, 4, 0, 0]}
                  name="Receitas"
                />
                <Bar 
                  dataKey="Despesas" 
                  fill={CORES_PRIMARIAS.despesa} 
                  radius={[4, 4, 0, 0]}
                  name="Despesas"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Rankings */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Maiores Despesas em {filtroAno}</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={rankingDespesasAno.sort((a, b) => b.value - a.value).slice(0, 8)} 
                  layout="vertical"
                  margin={{ left: 100 }}
                >
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={CORES_PRIMARIAS.despesa} 
                    radius={[0, 4, 4, 0]}
                    name="Valor"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Maiores Receitas em {filtroAno}</h3>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={rankingReceitasAno.sort((a, b) => b.value - a.value).slice(0, 8)} 
                  layout="vertical"
                  margin={{ left: 100 }}
                >
                  <XAxis type="number" />
                  <YAxis 
                    dataKey="name" 
                    type="category" 
                    width={120}
                    tick={{ fontSize: 12 }}
                  />
                  <Tooltip 
                    formatter={(value) => [`R$ ${value.toFixed(2)}`, 'Valor']}
                  />
                  <Bar 
                    dataKey="value" 
                    fill={CORES_PRIMARIAS.receita} 
                    radius={[0, 4, 4, 0]}
                    name="Valor"
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Relatorios;