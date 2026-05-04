
import { GoogleGenAI, ThinkingLevel } from "@google/genai";
import { Sale, Product, FinanceTransaction } from "./types";

let aiClient: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!aiClient) {
    // No ambiente do AI Studio Build, a chave do sistema é process.env.GEMINI_API_KEY
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey) {
      console.warn("GEMINI_API_KEY não encontrada. Certifique-se de que o 'AI Studio Free Tier' está ativo no menu Secrets.");
      return null;
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
};

export const analyzeSalesPerformance = async (
  sales: Sale[],
  products: Product[],
  transactions: FinanceTransaction[],
  companyName: string
) => {
  const ai = getAIClient();
  if (!ai) return "Configuração de IA pendente. Verifique a chave de API.";

  // Preparar dados ultra-compactos para reduzir tokens
  const totalSales = sales.length;
  const totalRevenue = sales.reduce((acc, sale) => acc + sale.total, 0);
  const bestSellers = sales
    .flatMap(s => s.items)
    .reduce((acc: any, item) => {
      acc[item.product_id] = (acc[item.product_id] || 0) + item.quantity;
      return acc;
    }, {});
  
  const topProductIds = Object.entries(bestSellers)
    .sort(([, a]: any, [, b]: any) => b - a)
    .slice(0, 3)
    .map(([id]) => id);

  const topProductsNames = topProductIds.map(id => {
    const p = products.find(prod => prod.id === id);
    return p ? p.name : "Desconhecido";
  });

  const prompt = `
    Analise os dados de vendas da empresa "${companyName}":
    - Vendas totais: ${totalSales}
    - Faturamento total: R$ ${totalRevenue.toFixed(2)}
    - Principais produtos: ${topProductsNames.join(", ")}
    
    Forneça 3 insights estratégicos curtos e práticos para aumentar os lucros.
    Seja extremamente conciso e direto. Use no máximo 150 palavras no total.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.1-flash-lite-preview",
      contents: prompt,
      config: {
        systemInstruction: "Você é um consultor especializado em varejo e PDV. Forneça insights práticos baseados nos dados. Use um tom profissional e direto.",
        maxOutputTokens: 250,
        thinkingConfig: { thinkingLevel: ThinkingLevel.MINIMAL }
      },
    });

    return response.text;
  } catch (error) {
    console.error("Erro ao consultar Gemini:", error);
    return "Desculpe, ocorreu um erro ao gerar os insights. Tente novamente mais tarde.";
  }
};
