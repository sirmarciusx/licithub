import { Bidding } from "../types/bidding";

const MOCK_BIDDINGS: Bidding[] = [
  {
    id: "92837/2024",
    title: "CONTRATAÇÃO DE EMPRESA PARA OBRAS DE PAVIMENTAÇÃO",
    portal: "PNCP",
    sourceUrl: "https://pncp.gov.br",
    description: "Contratação de empresa especializada em engenharia para pavimentação asfáltica de vias urbanas no município, abrangendo 15km de extensão com inclusão de drenagem pluvial e sinalização viária completa.",
    value: 4500000,
    location: "Curitiba - PR",
    openingDate: "15/10/2024",
    category: "Obras Civis",
    status: "Aberto"
  },
  {
    id: "10294/2024",
    title: "AQUISIÇÃO DE EQUIPAMENTOS DE INFORMÁTICA E SERVIDORES",
    portal: "Comprasnet",
    sourceUrl: "https://comprasnet.gov.br",
    description: "Aquisição de 500 computadores desktop, 200 notebooks e 5 servidores de rack para atualização do parque tecnológico da secretaria de educação.",
    value: 2850000,
    location: "São Paulo - SP",
    openingDate: "22/10/2024",
    category: "Tecnologia",
    status: "Aberto"
  },
  {
    id: "55412/2024",
    title: "FORNECIMENTO DE INSUMOS HOSPITALARES",
    portal: "Licitações-e",
    sourceUrl: "https://licitacoes-e.com.br",
    description: "Registro de preços para eventual e futura aquisição de materiais médico-hospitalares (seringas, luvas, gazes, cateteres) para atender a rede municipal de saúde por 12 meses.",
    value: 1200000,
    location: "Belo Horizonte - MG",
    openingDate: "10/11/2024",
    category: "Saúde",
    status: "Aberto"
  },
  {
    id: "33211/2024",
    title: "PRESTAÇÃO DE SERVIÇOS DE LIMPEZA E CONSERVAÇÃO",
    portal: "Portal Transparência",
    sourceUrl: "https://portaltransparencia.gov.br",
    description: "Contratação de empresa para prestação de serviços continuados de limpeza, conservação e higienização para os prédios administrativos do tribunal de justiça.",
    value: 850000,
    location: "Rio de Janeiro - RJ",
    openingDate: "05/11/2024",
    category: "Serviços Limpeza",
    status: "Em Andamento"
  },
  {
    id: "88741/2024",
    title: "AQUISIÇÃO DE GÊNEROS ALIMENTÍCIOS (MERENDA)",
    portal: "PNCP",
    sourceUrl: "https://pncp.gov.br",
    description: "Aquisição de gêneros alimentícios perecíveis e não perecíveis (carnes, grãos, vegetais) destinados ao preparo da merenda escolar das unidades de ensino integrado.",
    value: 3400000,
    location: "Porto Alegre - RS",
    openingDate: "30/10/2024",
    category: "Alimentos",
    status: "Aberto"
  },
  {
    id: "19284/2024",
    title: "DESENVOLVIMENTO DE SOFTWARE DE GESTÃO TRIBUTÁRIA",
    portal: "Comprasnet",
    sourceUrl: "https://comprasnet.gov.br",
    description: "Serviço especializado de desenvolvimento, implantação e manutenção de sistema web para modernização da arrecadação e gestão de tributos municipais.",
    value: 1560000,
    location: "Florianópolis - SC",
    openingDate: "01/11/2024",
    category: "Tecnologia",
    status: "Aberto"
  }
];

// Simulando delay de rede para parecer que está buscando em API real
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const searchBiddings = async (query: string, category: string = 'Todas'): Promise<Bidding[]> => {
  await delay(1200); // Finge lentidão da API

  let results = MOCK_BIDDINGS;

  // Filtrar por Categoria
  if (category !== 'Todas') {
    results = results.filter(b => b.category === category);
  }

  // Filtrar pela Busca (Query) ignorando maiúsculas
  if (query && query.trim() !== '') {
    const lowerQuery = query.toLowerCase();
    results = results.filter(b => 
      b.title.toLowerCase().includes(lowerQuery) ||
      b.description.toLowerCase().includes(lowerQuery) ||
      b.location.toLowerCase().includes(lowerQuery)
    );
  }

  return results;
};

// Aqui o resumo sem inteligência artificial, criando algo padronizado
export const summarizeBidding = async (bidding: Bidding): Promise<string> => {
  await delay(800);
  
  return `Resumo Automático Estruturado:

1. Objeto Principal:
${bidding.title}
A contratação foca em ${bidding.category.toLowerCase()} na região de ${bidding.location}.

2. Orçamento e Escopo:
O valor estimado do edital é em torno de R$ ${bidding.value?.toLocaleString('pt-BR')} (Sujeito à confirmação no edital).

3. Dicas de Participação:
- Verifique a capacidade técnica exigida para o volume em edital.
- Considere a adequação no cronograma de desembolso para execução das entregas na região.
- Revise toda a documentação fiscal e jurídica antes de inserir as propostas no portal ${bidding.portal}.`;
};
