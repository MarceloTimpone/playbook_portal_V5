/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, HeadingLevel, AlignmentType, WidthType, BorderStyle } from 'docx';
import { saveAs } from 'file-saver';

export async function generateTechnicalSpecification() {
  const cellBorder = {
    top: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    bottom: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    left: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
    right: { style: BorderStyle.SINGLE, size: 1, color: "CCCCCC" },
  };

  const tableHeaderCell = (text: string) => new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold: true, color: "FFFFFF" })],
      alignment: AlignmentType.CENTER,
    })],
    shading: { fill: "1B365D" }, // Exed Dark Blue
    margins: { top: 120, bottom: 120, left: 120, right: 120 },
  });

  const tableDataCell = (text: string, bold = false, align: any = AlignmentType.LEFT) => new TableCell({
    children: [new Paragraph({
      children: [new TextRun({ text, bold })],
      alignment: align,
    })],
    borders: cellBorder,
    margins: { top: 100, bottom: 100, left: 100, right: 100 },
  });

  const heading1Options = (text: string) => new Paragraph({
    children: [new TextRun({ text, bold: true, color: "1B365D" })],
    heading: HeadingLevel.HEADING_1,
    spacing: { before: 400, after: 200 },
  });

  const heading2Options = (text: string) => new Paragraph({
    children: [new TextRun({ text, bold: true, color: "C5A059" })],
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 300, after: 150 },
  });

  const bodyParagraph = (text: string, options: { before?: number, after?: number, bullet?: boolean } = {}) => {
    return new Paragraph({
      children: [new TextRun({ text })],
      bullet: options.bullet ? { level: 0 } : undefined,
      spacing: { before: options.before, after: options.after ?? 120 },
    });
  };

  const codeParagraph = (text: string) => new Paragraph({
    children: [new TextRun({ text, font: "Courier New", size: 18, color: "333333" })],
    spacing: { before: 50, after: 50 },
  });

  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          // COVER PAGE
          new Paragraph({ text: "", spacing: { before: 1000 } }),
          new Paragraph({
            children: [
              new TextRun({
                text: "EXED CONSULTING S/4HANA PROJECT PORTAL",
                bold: true,
                size: 48, // 24pt
                color: "1B365D",
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "DOCUMENTO DE ESPECIFICAÇÃO TÉCNICA (TO-BE)",
                bold: true,
                size: 24, // 12pt
                color: "C5A059", // Warm Gold
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 1200 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Versão: 1.0 (Oficial)",
                bold: true,
                size: 20,
              })
            ],
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "Autor: PMO Corporativo & Arquitetura de TI",
                size: 20,
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 2000 },
          }),
          new Paragraph({
            children: [
              new TextRun({
                text: "© 2026 Exed Consulting. Todos os direitos reservados. Confidencial.",
                size: 16,
                italics: true,
              })
            ],
            alignment: AlignmentType.CENTER,
          }),
          
          // PAGE BREAK - SECTION 1
          new Paragraph({ text: "", spacing: { before: 1000 } }),
          heading1Options("1. Escopo Funcional do Webapp"),
          
          bodyParagraph("Este portal de projetos centraliza e governa os processos operacionais e financeiros relacionados ao ciclo de vida de clientes e projetos corporativos na Exed Consulting. Ele conecta de forma síncrona os departamentos Comercial (Pré-vendas), Administrativo/Financeiro e o PMO Corporativo ao ecossistema do SAP S/4HANA Cloud."),

          heading2Options("1.1 Lista das Funcionalidades do Portal"),
          bodyParagraph("Dashboard Estratégico de BI: Renderização gráfica de KPIs gerenciais (Total de Projetos, Chaves Sincronizadas, Pendentes de Homologação) e distribuição de soluções SAP RISE, GROW e SCE.", { bullet: true }),
          bodyParagraph("Cadastro de Parceiros (Clientes): Fluxo estruturado para preencher a Ficha Cadastral Inicial de novos parceiros com CNPJ, País de Origem e Notas de Controle, seguido de homologação e atribuição de Partner ID.", { bullet: true }),
          bodyParagraph("Solicitação de Projetos Multimoedas: Suporte à criação de propostas com múltiplas moedas estrangeiras espelho. Cada moeda aciona chaves contábeis (CO/FI) independentes e provisionamento automático em lote.", { bullet: true }),
          bodyParagraph("Lista Mestre de Governança: Painel centralizado que exibe o andamento de todos os projetos cadastrados. Permite a edição direta sob credenciais do PMO e controle de exclusão lógica de registros.", { bullet: true }),
          bodyParagraph("Configuração Cambial: Interface financeira dedicada ao cadastro de taxas cambiais ativas, atualizando dinamicamente as conversões aplicadas em novos projetos e propostas.", { bullet: true }),
          bodyParagraph("Central de Notificações: Dispositivo de cabeçalho com sinalizadores em tempo real sobre submissões de clientes, alterações de status e workflows cambiais pendentes.", { bullet: true }),
          bodyParagraph("Exportação PMO de Auditoria: Módulo de extração de relatórios consolidados em formatos CSV (Planilha Excel), PDF estruturado para impressão corporativa imediata ou PPTX/TXT estruturado para reuniões de acompanhamento.", { bullet: true }),

          heading2Options("1.2 Fluxos de Negócio Coesos"),
          bodyParagraph("A. Fluxo de Registro de Parceiros (Clientes):", { before: 100 }),
          bodyParagraph("1. O Comercial preenche a Ficha Inicial informando o CNPJ do cliente e a origem."),
          bodyParagraph("2. O sistema define o status como 'PENDING' na fila do Financeiro."),
          bodyParagraph("3. O Financeiro realiza a auditoria cadastral e cria fisicamente o Business Partner no S/4HANA."),
          bodyParagraph("4. O Financeiro registra o ID do Parceiro SAP gerado no portal."),
          bodyParagraph("5. O status do parceiro é alterado para 'ACTIVE', desbloqueando-o para vínculos operacionais."),

          bodyParagraph("B. Fluxo de Criação de Projetos Espelhos Multimoedas:", { before: 150 }),
          bodyParagraph("1. O Comercial cadastra a proposta na moeda padrão (BRL) e seleciona as Moedas Estrangeiras Espelho contratadas (ex: USD)."),
          bodyParagraph("2. O status transita para 'PENDING_FINANCE' na fila financeira."),
          bodyParagraph("3. O Financeiro acessa a ficha e detalha individualmente as chaves CO/FI (Organização, Centro de Custo/Lucro) para cada moeda selecionada."),
          bodyParagraph("4. O status transita para 'PENDING_PMO' para validação final."),
          bodyParagraph("5. Ao clicar em 'Aprovar', o PMO dispara um loop automático no S/4HANA. Para cada moeda cadastrada, são disparadas duas chamadas OData síncronas de criação (um Projeto Comercial Operacional e um Projeto de Pré-vendas correspondente), automatizando o setup fiscal."),

          bodyParagraph("C. Fluxo de Encerramento Contratual:", { before: 150 }),
          bodyParagraph("1. Um Gerente de Projetos ou Comercial abre chamado de encerramento justificando formalmente os motivos operacionais."),
          bodyParagraph("2. O status do projeto na Lista Mestre passa a 'PENDING_CLOSURE'."),
          bodyParagraph("3. O PMO Corporativo analisa o pleito e concede a homologação final de fechamento."),
          bodyParagraph("4. O sistema muda o status definitivo para 'CLOSED' na planilha mestre local (retendo o histórico contábil para conformidade SOX sem apagar o registro) e aciona o encerramento de atividades/estágios diretamente na API SAP."),

          heading2Options("1.3 Matriz de Atribuições RACI e Perfis de Usuários"),
          bodyParagraph("O sistema é projetado de forma rígida em torno da matriz de atribuições. Cada papel atua estritamente em sua etapa delimitada do fluxo de criação e manutenção:"),

          // TABLE: MATRIZ RACI
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  tableHeaderCell("Atividade / Etapa"),
                  tableHeaderCell("Comercial (Solicitante)"),
                  tableHeaderCell("Financeiro"),
                  tableHeaderCell("PMO Corporativo"),
                ],
              }),
              new TableRow({
                children: [
                  tableDataCell("Preencher Ficha Cadastral (Inicial)"),
                  tableDataCell("R (Responsável)", true, AlignmentType.CENTER),
                  tableDataCell("C (Consultado)", false, AlignmentType.CENTER),
                  tableDataCell("I (Informado)", false, AlignmentType.CENTER),
                ],
              }),
              new TableRow({
                children: [
                  tableDataCell("Revisar e Validar Dados Financeiros"),
                  tableDataCell("C (Consultado)", false, AlignmentType.CENTER),
                  tableDataCell("R (Responsável)", true, AlignmentType.CENTER),
                  tableDataCell("I (Informado)", false, AlignmentType.CENTER),
                ],
              }),
              new TableRow({
                children: [
                  tableDataCell("Revisão Final e Aprovação (Portal)"),
                  tableDataCell("C (Consultado)", false, AlignmentType.CENTER),
                  tableDataCell("C (Consultado)", false, AlignmentType.CENTER),
                  tableDataCell("R / A (Aprovador)", true, AlignmentType.CENTER),
                ],
              }),
              new TableRow({
                children: [
                  tableDataCell("Disparar APIs de Criação S/4HANA"),
                  tableDataCell("I (Informado)", false, AlignmentType.CENTER),
                  tableDataCell("I (Informado)", false, AlignmentType.CENTER),
                  tableDataCell("R (Automático pelo PMO)", true, AlignmentType.CENTER),
                ],
              }),
              new TableRow({
                children: [
                  tableDataCell("Encerramento / Exclusão de Projetos"),
                  tableDataCell("R (Apenas Solicitar)", false, AlignmentType.CENTER),
                  tableDataCell("I (Informado)", false, AlignmentType.CENTER),
                  tableDataCell("A (Aprova / Executa)", true, AlignmentType.CENTER),
                ],
              }),
              new TableRow({
                children: [
                  tableDataCell("Alteração Direta da Lista Mestre"),
                  tableDataCell("N/A (Bloqueado)", false, AlignmentType.CENTER),
                  tableDataCell("N/A (Bloqueado)", false, AlignmentType.CENTER),
                  tableDataCell("R / A (Permissão Única)", true, AlignmentType.CENTER),
                ],
              }),
            ],
          }),

          new Paragraph({ text: "", spacing: { before: 300 } }),
          heading1Options("2. Especificações Técnicas do Ambiente SAP"),
          
          bodyParagraph("Mapeamento tecnológico para as transações de dados entre o portal corporativo e as instâncias do ERP central da Exed Consulting."),

          bodyParagraph("• Landscape do ERP: Confirmado SAP S/4HANA Cloud Public Edition. A release ou versão específica do sistema operacional HANA está em fase de homologação junto ao integrador de sistemas responsável pela infraestrutura física, não sendo detalhada nesta etapa."),
          bodyParagraph("• APIs Disponibilizadas: A integração síncrona utiliza os serviços padrão do SAP API Business Hub sob o protocolo OData v2 exposto pelo gateway de nuvem pública:"),
          bodyParagraph("   1. API_BUSINESS_PARTNER: Utilizada para criação e manutenção de registros de Parceiros de Negócio (Clientes)."),
          bodyParagraph("   2. API_COMMERCIAL_PROJECT_SRV: Utilizada para provisionamento e gestão do ciclo de vida de projetos comerciais e WBS Elements."),
          bodyParagraph("• Método de Integração: No ambiente de demonstração, o portal simula requisições diretas. Para o ambiente de produção da Exed, a arquitetura de referência exige o emprego do SAP BTP (Business Technology Platform) Integration Suite agindo como barramento middleware, realizando autenticação intermediária, roteamento seguro e telemetria de tráfego."),
          bodyParagraph("• Mecanismo de Autenticação: Conexão segura de servidor para servidor baseada em OAuth 2.0 Client Credentials, garantindo a proteção contra roubo de tokens e criptografia total das requisições via TLS 1.3."),
          bodyParagraph("• Cenários de Comunicação (Communication Scenarios): Configuração obrigatória no S/4HANA Cloud de dois cenários padrão para liberação das rotas externas OData:"),
          bodyParagraph("   - SAP_COM_0008 (Business Partner Integration Scenario)."),
          bodyParagraph("   - SAP_COM_0308 (Commercial Project Management Integration Scenario)."),

          heading1Options("3. Documentos/Artefatos Formais do SAP"),
          bodyParagraph("Mapeamento físico de esquemas de payloads de APIs e dicionário de dados relacional para apoiar o desenvolvimento técnico dos analistas de sistemas SAP:"),

          heading2Options("3.1 Exemplo de Payload para Criação de Cliente (SAP_COM_0008)"),
          codeParagraph("POST /sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner"),
          codeParagraph("{"),
          codeParagraph("  \"BusinessPartnerCategory\": \"2\",  // Organização"),
          codeParagraph("  \"BusinessPartnerFullName\": \"Votorantim S.A.\","),
          codeParagraph("  \"TaxNumber1\": \"03443511000122\",          // CNPJ sem máscara"),
          codeParagraph("  \"SearchTerm1\": \"VOTORANTIM\","),
          codeParagraph("  \"Country\": \"BR\""),
          codeParagraph("}"),

          heading2Options("3.2 Exemplo de Payload para Criação de Projeto Comercial (SAP_COM_0308)"),
          codeParagraph("POST /sap/opu/odata/sap/API_COMMERCIAL_PROJECT_SRV/CommercialProjectSet"),
          codeParagraph("{"),
          codeParagraph("  \"ProjectID\": \"PRJ-S4-2026-009-USD\","),
          codeParagraph("  \"ProjectName\": \"S4 Public Votorantim (USD)\","),
          codeParagraph("  \"CustomerID\": \"0010049281\","),
          codeParagraph("  \"ProjectManager\": \"Ana Silva\","),
          codeParagraph("  \"StartDate\": \"2026-08-01T00:00:00\","),
          codeParagraph("  \"SalesOrganization\": \"1010\","),
          codeParagraph("  \"CostCenter\": \"CC-US-TIME-02\","),
          codeParagraph("  \"ProfitCenter\": \"PC-US-IMPLEMENT\""),
          codeParagraph("}"),

          heading2Options("3.3 Dicionário de Dados do Sistema"),
          bodyParagraph("Tabela de relacionamento dos elementos lógicos do portal para as tabelas físicas do banco de dados relacional SAP HANA:"),

          // TABLE: DICIONARIO
          new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows: [
              new TableRow({
                children: [
                  tableHeaderCell("Campo do Portal"),
                  tableHeaderCell("Tipo de Dados"),
                  tableHeaderCell("Tabela SAP Correspondente"),
                  tableHeaderCell("Elemento de Dado S/4"),
                ],
              }),
              new TableRow({
                children: [
                  tableDataCell("País Prestação"),
                  tableDataCell("VARCHAR(50) / Dropdown"),
                  tableDataCell("T005 (Countries)"),
                  tableDataCell("LAND1"),
                ],
              }),
              new TableRow({
                children: [
                  tableDataCell("Nome do Cliente"),
                  tableDataCell("VARCHAR(150) / Buscado"),
                  tableDataCell("BUT000 (General Partner Data)"),
                  tableDataCell("MC_NAME1"),
                ],
              }),
              new TableRow({
                children: [
                  tableDataCell("CNPJ do Cliente"),
                  tableDataCell("VARCHAR(20) / Validação"),
                  tableDataCell("DFK_TAX_NUM"),
                  tableDataCell("TAXNUM"),
                ],
              }),
              tableRowDataHelper("Tipo de Projeto", "VARCHAR(30) / ENUM", "/EXED/T_PRJ_TYPE", "PROJECT_TYPE", tableDataCell),
              tableRowDataHelper("Solução SAP", "VARCHAR(20) / ENUM", "/EXED/T_SAP_SOL", "SAP_SOLUTION", tableDataCell),
              tableRowDataHelper("Nome do Projeto", "VARCHAR(120) / Texto", "PRJP (Project Header)", "POST1", tableDataCell),
              tableRowDataHelper("Organização", "VARCHAR(10) / Dropdown", "TVKO (Sales Orgs)", "VKORG", tableDataCell),
              tableRowDataHelper("Centro de Custo", "VARCHAR(20) / Texto", "CSKS (Cost Center Master)", "KOSTL", tableDataCell),
              tableRowDataHelper("Centro de Lucro", "VARCHAR(20) / Texto", "CEPC (Profit Center Master)", "PRCTR", tableDataCell),
              tableRowDataHelper("Código Cambial", "VARCHAR(3) / Texto", "TCURC (Currency Master)", "WAERS", tableDataCell),
            ],
          }),

          new Paragraph({ text: "", spacing: { before: 300 } }),
          heading1Options("4. Requisitos Não-Funcionais e Compliance"),
          
          bodyParagraph("Critérios de qualidade de engenharia de software, resiliência operacional e governança de dados exigidos pelo PMO e TI da Exed Consulting:"),

          bodyParagraph("• Conformidade SOX (Sarbanes-Oxley): Todas as operações de modificação direta de células na Planilha Mestre, exclusões de projetos ou homologações de encerramento efetuadas pelo PMO Corporativo geram logs de auditoria imutáveis com carimbo de data/hora (timestamp), usuário executor e valores (Antes -> Depois). Isso previne fraudes e garante total conformidade com a auditoria interna/externa SOX."),
          bodyParagraph("• Segurança de Acesso e LGPD (Lei Geral de Proteção de Dados): Implementação do princípio de privilégio mínimo (PoLP). Informações cadastrais e chaves financeiras são visíveis e editáveis apenas por perfis especificamente autorizados (Financeiro e PMO). É garantido o mascaramento automático de dados tributários e bancários sensíveis em repouso (criptografia AES-256) e em trânsito (HTTPS/TLS 1.3), bem como procedimentos de consentimento, limpeza de registros órfãos e descarte seguro."),
          bodyParagraph("• Volumetria e Dimensionamento Esperado: O portal é dimensionado para gerenciar uma volumetria média mensal estimada de 50 a 100 novas solicitações de projetos comerciais/pré-vendas e cerca de 20 novos cadastros de clientes (Business Partners). O banco de dados e a fila de processamento suportam picos de concorrência típicos de fechamento mensal, com tempo de resposta das chamadas de sincronização OData de no máximo 2 segundos por projeto."),
          bodyParagraph("• Ambiente de Hospedagem (Deploy): A aplicação foi projetada para ser implantada em ambiente elástico de nuvem privada/pública corporativa da Exed Consulting, utilizando containers Docker robustos executados sob o Google Cloud Run ou Microsoft Azure Container Apps. Opcionalmente, pode ser orquestrado integrado à camada middleware SAP BTP (Business Technology Platform) Integration Suite para melhor rastreabilidade de barramento."),
          bodyParagraph("• Integridade Cadastral: Validação de expressões regulares (Regex) de CNPJ com cálculo de dígitos verificadores matemáticos, códigos cambiais ISO 4217 de 3 caracteres e regras de consistência contábil (impedindo campos em branco ou caracteres especiais nas chaves CO/FI)."),

          heading1Options("5. Arquitetura de Referência"),
          
          bodyParagraph("Visão em camadas e ecossistema de dados para o Portal de Projetos unificado com o SAP S/4HANA:"),

          codeParagraph("+--------------------------------------------------------------+"),
          codeParagraph("|                    CAMADA DE EXIBIÇÃO                         |"),
          codeParagraph("|  - Interface React 19 SPA (Vite / Tailwind CSS v4)           |"),
          codeParagraph("|  - Micro-animações nativas via Motion / Icons Lucide         |"),
          codeParagraph("+------------------------------+-------------------------------+"),
          codeParagraph("                               |  Chamadas REST síncronas"),
          codeParagraph("                               v"),
          codeParagraph("+--------------------------------------------------------------+"),
          codeParagraph("|                    CAMADA DE INTEGRAÇÃO / PROXY              |"),
          codeParagraph("|  - Servidor seguro Node.js encapsulado                       |"),
          codeParagraph("|  - Gestão de tokens de acesso OAuth 2.0 (Client Credentials) |"),
          codeParagraph("|  - Audit Log Manager (Trilha de Auditoria SOX / LGPD)        |"),
          codeParagraph("+------------------------------+-------------------------------+"),
          codeParagraph("                               |  REST / OData v2/v4 HTTPS"),
          codeParagraph("                               v"),
          codeParagraph("+--------------------------------------------------------------+"),
          codeParagraph("|            BARRAMENTO DE GOVERNANÇA (RECOMENDADO)             |"),
          codeParagraph("|  - SAP BTP Integration Suite (Business Technology Platform)   |"),
          codeParagraph("+------------------------------+-------------------------------+"),
          codeParagraph("                               |  Chamada RFC / OData interna"),
          codeParagraph("                               v"),
          codeParagraph("+--------------------------------------------------------------+"),
          codeParagraph("|                   NÚCLEO DO SISTEMA (ERP)                    |"),
          codeParagraph("|  - SAP S/4HANA Cloud Public Edition                          |"),
          codeParagraph("|  - Scenarios: SAP_COM_0008 (BP) & SAP_COM_0308 (Projects)    |"),
          codeParagraph("+--------------------------------------------------------------+"),

          heading2Options("5.1 Ferramentas e Frameworks Utilizados"),
          bodyParagraph("Frontend: React v19 para interface reativa modular.", { bullet: true }),
          bodyParagraph("Bundler: Vite v6 para compilação super rápida e otimizada de assets.", { bullet: true }),
          bodyParagraph("Design System: Tailwind CSS v4 para estilização baseada em utilitários, garantindo consistência visual em múltiplos temas (Claro, Escuro e Exed).", { bullet: true }),
          bodyParagraph("Animações: Framer Motion para transição elegante de componentes.", { bullet: true }),
          bodyParagraph("Bibliotecas de Exportação: docx v9 para estruturação dinâmica de documentos Word e visualizadores nativos para impressão em PDF.", { bullet: true }),
        ],
      },
    ],
  });

  function tableRowDataHelper(col1: string, col2: string, col3: string, col4: string, helper: any) {
    return new TableRow({
      children: [
        helper(col1),
        helper(col2),
        helper(col3),
        helper(col4),
      ],
    });
  }

  // Generate blob and download
  const blob = await Packer.toBlob(doc);
  saveAs(blob, "EXEDPORTAL_ESPECIFICACAO_TECNICA.docx");
}
