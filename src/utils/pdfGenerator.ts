/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * Utilitário profissional de geração de Documentação Técnica e Especificação Funcional (TO-BE) em formato PDF.
 * Gera um documento de altíssima fidelidade e detalhamento (equivalente a mais de 20 páginas de especificação estruturada)
 * contendo mockups visuais ricos desenhados em HTML/CSS para todos os menus e telas, abertos e fechados,
 * além de explicações exaustivas de integrações SAP S/4HANA, matriz RACI, dicionário de dados e fluxos operacionais.
 */
export function downloadTechnicalSpecificationPDF() {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert("Por favor, permita que pop-ups sejam abertos para visualizar e baixar a especificação em PDF.");
    return;
  }

  // Estilos CSS de alta definição para impressão física e digital
  const styles = `
    @import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@300;400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
    
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
    }
    
    body {
      font-family: 'Nunito Sans', sans-serif;
      color: #1e293b;
      line-height: 1.6;
      font-size: 11pt;
      background-color: #ffffff;
    }
    
    /* Configurações específicas de impressão */
    @page {
      size: A4;
      margin: 20mm 15mm 20mm 15mm;
    }
    
    @media print {
      body {
        background-color: #ffffff;
        color: #000000;
      }
      .page-break {
        display: block;
        page-break-before: always;
        break-before: page;
      }
      .no-print {
        display: none !important;
      }
    }
    
    .page {
      padding: 10px 0;
      position: relative;
    }
    
    .page-break {
      page-break-before: always;
      break-before: page;
      margin-top: 2rem;
    }
    
    /* Estilos de Capa */
    .cover-container {
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 250mm;
      padding: 20mm 10mm;
      border: 2px solid #1e3a8a;
      position: relative;
    }
    
    .cover-badge {
      align-self: flex-start;
      background-color: #6b1d2f;
      color: #ffffff;
      padding: 6px 14px;
      font-size: 10pt;
      font-weight: 700;
      letter-spacing: 2px;
      text-transform: uppercase;
      border-radius: 4px;
    }
    
    .cover-header {
      margin-top: 40mm;
      text-align: center;
    }
    
    .cover-title {
      font-size: 32pt;
      font-weight: 800;
      color: #1b365d;
      line-height: 1.2;
      margin-bottom: 5mm;
    }
    
    .cover-subtitle {
      font-size: 16pt;
      font-weight: 500;
      color: #c5a059;
      letter-spacing: 1.5px;
      margin-bottom: 25mm;
      text-transform: uppercase;
    }
    
    .cover-divider {
      width: 120px;
      height: 4px;
      background-color: #c5a059;
      margin: 0 auto 15mm auto;
    }
    
    .cover-metadata {
      margin-top: auto;
      border-top: 1px solid #cbd5e1;
      padding-top: 8mm;
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      font-size: 10pt;
      color: #475569;
    }
    
    .meta-item strong {
      color: #1e293b;
    }
    
    /* Cabeçalhos e Seções */
    h1 {
      font-size: 18pt;
      color: #1b365d;
      border-bottom: 2px solid #cbd5e1;
      padding-bottom: 4px;
      margin-top: 20pt;
      margin-bottom: 12pt;
      font-weight: 700;
      text-transform: uppercase;
      page-break-after: avoid;
      break-after: avoid;
    }
    
    h2 {
      font-size: 13pt;
      color: #6b1d2f;
      margin-top: 15pt;
      margin-bottom: 8pt;
      font-weight: 700;
      border-left: 4px solid #c5a059;
      padding-left: 8px;
      page-break-after: avoid;
      break-after: avoid;
    }
    
    h3 {
      font-size: 11pt;
      color: #334155;
      margin-top: 10pt;
      margin-bottom: 6pt;
      font-weight: 600;
      page-break-after: avoid;
      break-after: avoid;
    }
    
    p {
      margin-bottom: 10pt;
      text-align: justify;
      font-size: 10pt;
      color: #334155;
    }
    
    strong {
      color: #0f172a;
    }
    
    ul, ol {
      margin-bottom: 10pt;
      padding-left: 20px;
      font-size: 10pt;
      color: #334155;
    }
    
    li {
      margin-bottom: 4px;
    }
    
    /* Tabelas */
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10pt;
      margin-bottom: 15pt;
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    th, td {
      border: 1px solid #cbd5e1;
      padding: 8px 10px;
      font-size: 9pt;
      text-align: left;
      vertical-align: top;
    }
    
    th {
      background-color: #1b365d;
      color: #ffffff;
      font-weight: 600;
    }
    
    tr:nth-child(even) td {
      background-color: #f8fafc;
    }
    
    /* Blocos de Código / Configurações */
    pre, code {
      font-family: 'JetBrains Mono', monospace;
      font-size: 8.5pt;
      background-color: #f1f5f9;
      color: #0f172a;
    }
    
    pre {
      padding: 10px;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      white-space: pre-wrap;
      word-wrap: break-word;
      margin-bottom: 12pt;
    }
    
    code {
      padding: 1px 4px;
      border-radius: 3px;
    }
    
    /* Estilos Especiais de Alerta e Notas */
    .note-box {
      background-color: #fef3c7;
      border-left: 4px solid #d97706;
      padding: 10px 15px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 12pt;
      font-size: 9.5pt;
    }
    
    .note-box strong {
      color: #92400e;
    }
    
    .warning-box {
      background-color: #fee2e2;
      border-left: 4px solid #dc2626;
      padding: 10px 15px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 12pt;
      font-size: 9.5pt;
    }
    
    .warning-box strong {
      color: #991b1b;
    }

    .success-box {
      background-color: #f0fdf4;
      border-left: 4px solid #16a34a;
      padding: 10px 15px;
      border-radius: 0 6px 6px 0;
      margin-bottom: 12pt;
      font-size: 9.5pt;
    }
    
    .success-box strong {
      color: #166534;
    }
    
    /* ---- ESTILOS DOS MOCKUPS DE TELA (NÍVEL DE FIDELIDADE EXED) ---- */
    .mockup-header {
      background-color: #0f172a;
      color: #cbd5e1;
      padding: 8px 12px;
      border-radius: 8px 8px 0 0;
      font-size: 9px;
      font-weight: bold;
      letter-spacing: 1px;
      text-transform: uppercase;
      border-bottom: 1px solid #1e293b;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .mockup-status-dot {
      display: inline-block;
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background-color: #22c55e;
      margin-right: 6px;
    }
    
    .mockup-body {
      background-color: #f8fafc;
      border: 1px solid #cbd5e1;
      border-top: none;
      border-radius: 0 0 8px 8px;
      padding: 15px;
      font-size: 8.5pt;
      position: relative;
      margin-bottom: 25pt;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05);
      page-break-inside: avoid;
      break-inside: avoid;
    }
    
    .mockup-app-layout {
      display: grid;
      grid-template-columns: 140px 1fr;
      gap: 15px;
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      min-height: 380px;
      overflow: hidden;
    }
    
    .mockup-sidebar {
      background-color: #1e293b;
      color: #cbd5e1;
      padding: 12px 8px;
      display: flex;
      flex-direction: column;
      gap: 5px;
    }
    
    .mockup-sidebar-logo {
      font-weight: 800;
      color: #ffffff;
      font-size: 10px;
      margin-bottom: 15px;
      padding-bottom: 8px;
      border-b: 1px solid #334155;
      text-align: center;
      letter-spacing: 0.5px;
    }
    
    .mockup-sidebar-logo span {
      color: #c5a059;
    }
    
    .mockup-nav-item {
      padding: 5px 8px;
      border-radius: 4px;
      font-size: 8px;
      display: flex;
      align-items: center;
      gap: 6px;
      color: #94a3b8;
    }
    
    .mockup-nav-item.active {
      background-color: #2563eb;
      color: #ffffff;
      font-weight: 600;
    }
    
    .mockup-nav-item.active-exed {
      background-color: #6b1d2f;
      color: #ffffff;
      font-weight: 600;
    }
    
    .mockup-content {
      padding: 12px;
      display: flex;
      flex-direction: column;
      gap: 12px;
      overflow: hidden;
    }
    
    .mockup-app-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid #e2e8f0;
      padding-bottom: 8px;
    }
    
    .mockup-user-badge {
      display: flex;
      align-items: center;
      gap: 6px;
      font-size: 8px;
      background-color: #f1f5f9;
      padding: 4px 8px;
      border-radius: 12px;
      border: 1px solid #e2e8f0;
    }
    
    .mockup-badge-role {
      font-weight: bold;
      color: #2563eb;
    }
    
    .mockup-grid-kpi {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 8px;
    }
    
    .mockup-kpi-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 8px;
      display: flex;
      flex-direction: column;
      gap: 2px;
    }
    
    .mockup-kpi-title {
      font-size: 7px;
      text-transform: uppercase;
      color: #64748b;
      font-weight: 600;
    }
    
    .mockup-kpi-value {
      font-size: 13px;
      font-weight: 800;
      color: #0f172a;
    }
    
    .mockup-card {
      background-color: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 6px;
      padding: 12px;
    }
    
    .mockup-card-title {
      font-size: 9px;
      font-weight: 700;
      color: #1e293b;
      margin-bottom: 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    /* Dropdown de Notificações Ativo */
    .mockup-notif-dropdown {
      position: absolute;
      top: 55px;
      right: 15px;
      width: 220px;
      background-color: #ffffff;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
      z-index: 50;
      padding: 5px 0;
    }
    
    .mockup-notif-header {
      padding: 4px 8px;
      background-color: #f8fafc;
      border-bottom: 1px solid #e2e8f0;
      font-size: 7px;
      font-weight: 800;
      color: #64748b;
      text-transform: uppercase;
      display: flex;
      justify-content: space-between;
    }
    
    .mockup-notif-item {
      padding: 6px 8px;
      border-bottom: 1px solid #f1f5f9;
      font-size: 7.5px;
    }
    
    .mockup-notif-item.unread {
      background-color: #eff6ff;
      font-weight: bold;
    }
    
    /* Formulários de Cadastro */
    .mockup-form-group {
      margin-bottom: 8px;
    }
    
    .mockup-label {
      display: block;
      font-size: 7.5px;
      font-weight: 600;
      color: #475569;
      margin-bottom: 2px;
    }
    
    .mockup-input {
      width: 100%;
      padding: 4px 6px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-size: 8px;
      background-color: #ffffff;
    }
    
    .mockup-select {
      width: 100%;
      padding: 4px 6px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      font-size: 8px;
      background-color: #ffffff;
    }
    
    .mockup-btn {
      background-color: #2563eb;
      color: #ffffff;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 8px;
      font-weight: 600;
      border: none;
      display: inline-block;
      text-align: center;
    }

    .mockup-btn-exed {
      background-color: #6b1d2f;
      color: #ffffff;
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 8px;
      font-weight: 600;
      border: none;
      display: inline-block;
      text-align: center;
    }
    
    /* Painel de Edição Direta do PMO */
    .mockup-pmo-editor {
      background-color: #fefefe;
      border: 2px dashed #3b82f6;
      border-radius: 6px;
      padding: 10px;
      margin-top: 10px;
    }
    
    /* Grid de Dados */
    .mockup-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 7.5px;
    }
    
    .mockup-table th, .mockup-table td {
      padding: 4px 6px;
      border: 1px solid #e2e8f0;
    }
    
    .mockup-table th {
      background-color: #f1f5f9;
      color: #475569;
      font-weight: 600;
      text-align: left;
    }
    
    .mockup-badge {
      padding: 1px 4px;
      border-radius: 3px;
      font-size: 6.5px;
      font-weight: bold;
    }
    
    .mockup-badge-active { background-color: #dcfce7; color: #166534; }
    .mockup-badge-pending { background-color: #fef3c7; color: #92400e; }
    .mockup-badge-sap { background-color: #dbeafe; color: #1e40af; }
    .mockup-badge-closed { background-color: #f1f5f9; color: #475569; }
    
    /* Barra Superior Fixada de Impressão */
    .print-control-bar {
      background-color: #1e293b;
      color: #ffffff;
      padding: 12px 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 10pt;
      box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
      border-radius: 8px;
      margin-bottom: 20px;
    }
    
    .print-control-btn {
      background-color: #2563eb;
      color: #ffffff;
      padding: 8px 16px;
      border-radius: 6px;
      font-weight: 600;
      font-size: 9.5pt;
      border: none;
      cursor: pointer;
      transition: background-color 0.2s;
    }
    
    .print-control-btn:hover {
      background-color: #1d4ed8;
    }

    .toc-item {
      display: flex;
      justify-content: space-between;
      border-bottom: 1px dotted #cbd5e1;
      margin-bottom: 8px;
      font-size: 10pt;
    }

    .toc-page {
      font-weight: bold;
      color: #1b365d;
    }
  `;

  const htmlContent = `
    <!DOCTYPE html>
    <html lang="pt-BR">
    <head>
      <meta charset="UTF-8">
      <title>EXEDPORTAL_ESPECIFICACAO_TECNICA</title>
      <style>${styles}</style>
    </head>
    <body>
      
      <!-- BARRA DE CONTROLE DO NAVEGADOR (NÃO SAI NO PDF) -->
      <div class="print-control-bar no-print">
        <div>
          <strong>Portal de Projetos Exed S/4HANA</strong> - Exportador Inteligente de Especificação Técnica em PDF
        </div>
        <button class="print-control-btn" onclick="window.print()">
          Clique Aqui para Imprimir ou Salvar como PDF 📄
        </button>
      </div>

      <!-- PÁGINA 1: CAPA -->
      <div class="page">
        <div class="cover-container">
          <div class="cover-badge">EXED S/4HANA PORTAL</div>
          <div class="cover-header">
            <h1 class="cover-title">PORTAL DE PROJETOS S/4HANA PUBLIC EDITION</h1>
            <div class="cover-divider"></div>
            <div class="cover-subtitle">ESPECIFICAÇÃO TÉCNICA E ARQUITETURA DE TI (TO-BE)</div>
            <p style="text-align: center; color: #475569; font-size: 11pt; font-style: italic;">
              Volume de Documentação de Engenharia Detalhada e Mockups Funcionais Completos
            </p>
          </div>
          <div class="cover-metadata">
            <div class="meta-item">
              <strong>Organização:</strong> Exed Consulting S.A.<br>
              <strong>Área:</strong> PMO Corporativo & Engenharia de Sistemas<br>
              <strong>Versão:</strong> 1.0 (Especificação To-Be)<br>
              <strong>Classificação:</strong> Altamente Confidencial - Uso Interno
            </div>
            <div class="meta-item" style="text-align: right;">
              <strong>Data de Geração:</strong> 14 de Julho de 2026<br>
              <strong>ID do Projeto:</strong> PROJ-EXED-S4-PORTAL<br>
              <strong>Autor principal:</strong> PMO Corporativo & Arquiteto SAP Lead<br>
              <strong>Formato:</strong> PDF de Alta Resolução / Vetorial
            </div>
          </div>
        </div>
      </div>

      <!-- PÁGINA 2: ÍNDICE DE CONTEÚDO (TOC) -->
      <div class="page-break"></div>
      <div class="page">
        <h1>Sumário Executivo e Índice Geral</h1>
        <p style="margin-bottom: 20px;">Este manual fornece o detalhamento necessário de todas as frentes lógicas do software para o desenvolvimento físico do Portal de Projetos. Siga os capítulos em ordem cronológica de codificação.</p>
        
        <div style="margin-top: 30px;">
          <div class="toc-item"><span>1. Introdução, Escopo Geral e Justificativa Tecnológica (Business Case)</span><span class="toc-page">Pág. 03</span></div>
          <div class="toc-item"><span>2. Perfis de Governança Lógicos e Matriz RACI Estendida</span><span class="toc-page">Pág. 04</span></div>
          <div class="toc-item"><span>3. Dicionário de Dados do Sistema e Mapeamento de Tabelas SAP S/4HANA</span><span class="toc-page">Pág. 06</span></div>
          <div class="toc-item"><span>4. Especificação de APIs OData e Fluxos de Sincronização Síncronos/Assíncronos</span><span class="toc-page">Pág. 08</span></div>
          <div class="toc-item"><span>5. Detalhes Técnicos e Regras de Negócio de cada Aba Funcional</span><span class="toc-page">Pág. 10</span></div>
          <div class="toc-item"><span>6. Mecanismo Cambial e Criação em Lote de Projetos Espelhos</span><span class="toc-page">Pág. 12</span></div>
          <div class="toc-item"><span>7. Segurança, Rastreabilidade (Audit Logs) e Conformidade SOX</span><span class="toc-page">Pág. 14</span></div>
          <div class="toc-item"><span>8. Catálogo Visível de Mockups do Aplicativo (Telas Abertas & Fechadas)</span><span class="toc-page">Pág. 16</span></div>
          <div class="toc-item"><span>9. Manual de Desenvolvimento (Stack, Deployment e Pipeline CI/CD)</span><span class="toc-page">Pág. 21</span></div>
        </div>
      </div>

      <!-- PÁGINA 3: CAPÍTULO 1 -->
      <div class="page-break"></div>
      <div class="page">
        <h1>1. Introdução, Escopo Geral e Justificativa Tecnológica</h1>
        <h2>1.1 Objetivo do Sistema (To-Be)</h2>
        <p>A Exed Consulting S.A. atua no segmento de consultoria corporativa especializada em implementação de sistemas de gestão SAP. Historicamente, a criação de projetos no ecossistema **SAP S/4HANA Public Edition** exigia etapas manuais altamente complexas, nas quais o profissional administrativo necessitava acessar múltiplos aplicativos SAP Fiori, preencher parametrizações financeiras redundantes e criar individualmente contas de absorção de horas (projetos de pré-vendas e projetos comerciais principais). Este workflow descentralizado gerava lacunas operacionais, falta de rastreabilidade de aprovações e atrasos de faturamento.</p>
        <p>O **Portal de Projetos S/4HANA** surge como a solução unificada ("Single Point of Entry"). Através dele, a frente comercial, o time administrativo-financeiro e o PMO Corporativo operam de forma harmônica em um barramento integrado via Web, que automatiza a governança, as aprovações e a persistência sistêmica no ERP.</p>
        
        <h2>1.2 Justificativa de Engenharia e Ganhos de Processo</h2>
        <ul>
          <li><strong>Mitigação de Inconsistências de Chaves Contábeis:</strong> O formulário web valida e restringe as associações de Organizações de Vendas, Centros de Custo e Centros de Lucro com base em regras fiscais estritas pré-cadastradas.</li>
          <li><strong>Garantia de Governança Multimoedas (SLA Cambial):</strong> O sistema implementa um faturamento comercial espelhado, no qual múltiplos projetos em moedas estrangeiras espelho são criados de maneira síncrona na aprovação do PMO, garantindo o correto hedge cambial e o registro idôneo das horas trabalhadas por consultores internacionais.</li>
          <li><strong>Rastreabilidade SOX (Sarbanes-Oxley Act):</strong> Todas as transações críticas - como exclusão física de registros da base ou solicitações de encerramento contratual - são registradas de forma indelével na trilha de auditoria (audit logging), garantindo conformidade com padrões de auditoria externa de grandes companhias de TI.</li>
        </ul>
      </div>

      <!-- PÁGINA 4: CAPÍTULO 2 -->
      <div class="page-break"></div>
      <div class="page">
        <h1>2. Perfis de Governança Lógicos e Matriz RACI Estendida</h1>
        <h2>2.1 Perfis de Usuários (Acessos Estritos)</h2>
        <p>A aplicação impõe regras de visibilidade e ação de acordo com o perfil lógico do usuário autenticado no portal corporativo. São mapeados quatro perfis nucleares:</p>
        <ol>
          <li><strong>Comercial / Solicitante (Pré-vendas):</strong> Responsável pela captação primária das oportunidades de projetos e necessidades cadastrais de novos clientes. Seus acessos são limitados ao preenchimento de propostas comerciais (Ficha Comercial BRL + indicação de Moedas Estrangeiras Espelho desejadas) e à submissão de novos dados cadastrais de clientes. Tem visualização restrita aos KPIs do seu pipeline e não pode alterar parametrizações contábeis.</li>
          <li><strong>Administrativo / Financeiro:</strong> Responsável pela governança fiscal. Detém controle exclusivo sobre o preenchimento de chaves CO/FI individuais para cada moeda requisitada pelo comercial na ficha de projetos. É a única frente capaz de ativar de forma definitiva novos Business Partners (clientes) no S/4HANA e gerenciar a tabela cambial de conversão monetária ativa.</li>
          <li><strong>Governança de PM (Auditoria Operacional):</strong> Perfil fiscalizador de entregáveis. Acompanha a execução de projetos, audita apontamentos de horas e detém a prerrogativa técnica de submeter requisições justificadas de encerramento contratual de projetos comerciais.</li>
          <li><strong>PMO Corporativo (Super Administrador):</strong> Perfil de maior privilégio do portal. Possui autoridade máxima para aprovação unificada de fichas cadastrais de projetos, comando manual de disparo de integrações OData, alteração direta de células na Planilha Mestre de projetos ativos, parametrização global do sistema e arquivamento final de logs de transação.</li>
        </ol>

        <h2>2.2 Matriz RACI Detalhada (Matriz de Responsabilidade)</h2>
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Funcionalidade / Etapa do Processo</th>
              <th>Pré-Vendas / Comercial</th>
              <th>Financeiro / Adm.</th>
              <th>Governança PM</th>
              <th>PMO Corporativo</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Preenchimento da Ficha Comercial do Projeto</strong></td>
              <td><span style="color: #2563eb; font-weight: bold;">R</span> (Responsável)</td>
              <td><span style="color: #475569;">C</span> (Consultado)</td>
              <td><span style="color: #475569;">I</span> (Informado)</td>
              <td><span style="color: #475569;">I</span> (Informado)</td>
            </tr>
            <tr>
              <td><strong>Associação de Chaves CO/FI por Moeda</strong></td>
              <td><span style="color: #475569;">I</span> (Informado)</td>
              <td><span style="color: #2563eb; font-weight: bold;">R</span> (Responsável)</td>
              <td><span style="color: #475569;">I</span> (Informado)</td>
              <td><span style="color: #475569;">C</span> (Consultado)</td>
            </tr>
            <tr>
              <td><strong>Aprovação Operacional e Governança</strong></td>
              <td><span style="color: #475569;">C</span> (Consultado)</td>
              <td><span style="color: #475569;">C</span> (Consultado)</td>
              <td><span style="color: #475569;">I</span> (Informado)</td>
              <td><span style="color: #dc2626; font-weight: bold;">A</span> (Aprovador Máximo)</td>
            </tr>
            <tr>
              <td><strong>Validação Fiscal e Registro de Clientes (BP)</strong></td>
              <td><span style="color: #475569;">C</span> (Consultado)</td>
              <td><span style="color: #2563eb; font-weight: bold;">R</span> (Responsável)</td>
              <td><span style="color: #475569;">I</span> (Informado)</td>
              <td><span style="color: #475569;">I</span> (Informado)</td>
            </tr>
            <tr>
              <td><strong>Configuração Cambial (Moedas e Taxas)</strong></td>
              <td><span style="color: #475569;">I</span> (Informado)</td>
              <td><span style="color: #2563eb; font-weight: bold;">R</span> (Responsável)</td>
              <td><span style="color: #475569;">I</span> (Informado)</td>
              <td><span style="color: #2563eb; font-weight: bold;">R</span> / <span style="color: #dc2626; font-weight: bold;">A</span></td>
            </tr>
            <tr>
              <td><strong>Abertura de Solicitação de Fechamento</strong></td>
              <td><span style="color: #2563eb; font-weight: bold;">R</span> (Pode solicitar)</td>
              <td><span style="color: #475569;">I</span> (Informado)</td>
              <td><span style="color: #2563eb; font-weight: bold;">R</span> (Pode solicitar)</td>
              <td><span style="color: #dc2626; font-weight: bold;">A</span> (Aprova / Executa)</td>
            </tr>
            <tr>
              <td><strong>Edição Direta da Base Mestre de Projetos</strong></td>
              <td><span style="color: #dc2626; font-weight: bold;">Bloqueado</span></td>
              <td><span style="color: #dc2626; font-weight: bold;">Bloqueado</span></td>
              <td><span style="color: #dc2626; font-weight: bold;">Bloqueado</span></td>
              <td><span style="color: #2563eb; font-weight: bold;">R</span> / <span style="color: #dc2626; font-weight: bold;">A</span> (Irrestrito)</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PÁGINA 5: CAPÍTULO 3 -->
      <div class="page-break"></div>
      <div class="page">
        <h1>3. Dicionário de Dados do Sistema e Tabelas SAP S/4HANA</h1>
        <h2>3.1 Estruturas de Dados do Portal e Chaves Relacionais</h2>
        <p>Abaixo estão detalhados os schemas das tabelas e coleções de dados persistidos de forma segura no banco de dados e sincronizados com o S/4HANA Cloud.</p>
        
        <h3>Tabela A: Cadastro de Clientes (exed_customers)</h3>
        <table>
          <thead>
            <tr>
              <th>Coluna Lógica</th>
              <th>Tipo Físico</th>
              <th>Mapeamento SAP</th>
              <th>Regra de Negócio / Validação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>id</strong></td>
              <td>VARCHAR(50) [PK]</td>
              <td>N/A (GUID Interno)</td>
              <td>Gerado via UUID v4 na criação.</td>
            </tr>
            <tr>
              <td><strong>name</strong></td>
              <td>VARCHAR(150)</td>
              <td>BUT000-MC_NAME1</td>
              <td>Nome oficial da Razão Social do parceiro.</td>
            </tr>
            <tr>
              <td><strong>cnpj</strong></td>
              <td>VARCHAR(18) [Unique]</td>
              <td>DFK_TAX_NUM-TAXNUM</td>
              <td>Formato: XX.XXX.XXX/XXXX-XX. Validação dígito verificador.</td>
            </tr>
            <tr>
              <td><strong>country</strong></td>
              <td>VARCHAR(50)</td>
              <td>T005-LAND1</td>
              <td>País de prestação fiscal do cliente.</td>
            </tr>
            <tr>
              <td><strong>sapCode</strong></td>
              <td>VARCHAR(10) [Null]</td>
              <td>BUT000-PARTNER</td>
              <td>Preenchido pelo Financeiro após sincronização com S/4.</td>
            </tr>
            <tr>
              <td><strong>status</strong></td>
              <td>ENUM('PENDING', 'APPROVED')</td>
              <td>N/A</td>
              <td>'PENDING' aguarda código oficial SAP; 'APPROVED' ativo para projetos.</td>
            </tr>
          </tbody>
        </table>

        <h3>Tabela B: Cadastro de Projetos (exed_projects)</h3>
        <table>
          <thead>
            <tr>
              <th>Coluna Lógica</th>
              <th>Tipo Físico</th>
              <th>Mapeamento SAP</th>
              <th>Regra de Negócio / Validação</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>id</strong></td>
              <td>VARCHAR(50) [PK]</td>
              <td>N/A (GUID Interno)</td>
              <td>Identificador único do registro do portal.</td>
            </tr>
            <tr>
              <td><strong>name</strong></td>
              <td>VARCHAR(120)</td>
              <td>PRJP-POST1</td>
              <td>Nome comercial do escopo de serviços.</td>
            </tr>
            <tr>
              <td><strong>customerId</strong></td>
              <td>VARCHAR(50) [FK]</td>
              <td>BUT000-PARTNER</td>
              <td>Vinculado obrigatoriamente a um cliente 'APPROVED'.</td>
            </tr>
            <tr>
              <td><strong>sapProjectCode</strong></td>
              <td>VARCHAR(25) [Null]</td>
              <td>PROJ-PSPID</td>
              <td>ID físico oficial do projeto no SAP. Formato PRJ-S4-YYYY-XXXX.</td>
            </tr>
            <tr>
              <td><strong>type</strong></td>
              <td>ENUM('TIME_MATERIAL', 'FIXED_PRICE')</td>
              <td>/EXED/T_PRJ-TYPE</td>
              <td>Modelo de faturamento: por hora ou preço fechado.</td>
            </tr>
            <tr>
              <td><strong>sapSolution</strong></td>
              <td>ENUM('RISE', 'GROW', 'SCE')</td>
              <td>/EXED/T_SAP-SOL</td>
              <td>Solução SAP contratada pelo cliente.</td>
            </tr>
            <tr>
              <td><strong>manager</strong></td>
              <td>VARCHAR(100)</td>
              <td>PRJP-VERNA</td>
              <td>Nome do Gerente de Projetos Exed responsável.</td>
            </tr>
            <tr>
              <td><strong>status</strong></td>
              <td>ENUM('PENDING_FINANCE', 'PENDING_PMO', 'APPROVED', 'CLOSED')</td>
              <td>N/A</td>
              <td>Controla o fluxo de aprovação e governança.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PÁGINA 6: DICIONÁRIO DE DADOS PARTE 2 -->
      <div class="page-break"></div>
      <div class="page">
        <h1>3. Dicionário de Dados do Sistema (Parte 2)</h1>
        
        <h3>Tabela C: Configurações Cambiais e Moedas Ativas (exed_currencies)</h3>
        <p>Abaixo está detalhada a tabela de suporte à conversão cambial. O time Financeiro insere e atualiza estas taxas diretamente pela interface, permitindo que o formulário de cadastro de projetos aplique os cálculos contábeis de conversão monetária em tempo real.</p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Coluna Lógica</th>
              <th>Tipo Físico</th>
              <th>Mapeamento SAP</th>
              <th>Regra de Negócio / Descrição</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>code</strong></td>
              <td>VARCHAR(3) [PK]</td>
              <td>TCURC-WAERS</td>
              <td>Código ISO padrão de 3 caracteres (Ex: USD, EUR, BRL).</td>
            </tr>
            <tr>
              <td><strong>name</strong></td>
              <td>VARCHAR(50)</td>
              <td>TCURT-LTEXT</td>
              <td>Nome descritivo da moeda estrangeira cadastrada.</td>
            </tr>
            <tr>
              <td><strong>symbol</strong></td>
              <td>VARCHAR(5)</td>
              <td>N/A</td>
              <td>Símbolo de exibição financeira da moeda (Ex: $, €, R$).</td>
            </tr>
            <tr>
              <td><strong>conversionRate</strong></td>
              <td>DECIMAL(10,4)</td>
              <td>TCURR-UKURS</td>
              <td>Taxa de conversão direta da Moeda Estrangeira para a Moeda Base BRL.</td>
            </tr>
            <tr>
              <td><strong>isActive</strong></td>
              <td>BOOLEAN</td>
              <td>N/A</td>
              <td>Flag de controle de ativação cambial no portal.</td>
            </tr>
          </tbody>
        </table>

        <h3>Tabela D: Matriz de Chaves Contábeis CO/FI Relacionadas (exed_project_cofi)</h3>
        <p>Tabela de controle interno utilizada pelo time Financeiro para armazenar chaves de custos operacionais e faturamento financeiro SAP individuais por moeda habilitada para o projeto.</p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Coluna Lógica</th>
              <th>Tipo Físico</th>
              <th>Mapeamento SAP</th>
              <th>Regra de Negócio / Descrição</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>projectId</strong></td>
              <td>VARCHAR(50) [PK, FK]</td>
              <td>N/A</td>
              <td>Identificador do projeto relacionado na base.</td>
            </tr>
            <tr>
              <td><strong>currencyCode</strong></td>
              <td>VARCHAR(3) [PK, FK]</td>
              <td>TCURC-WAERS</td>
              <td>Código da moeda para a qual esta chave CO/FI se aplica.</td>
            </tr>
            <tr>
              <td><strong>salesOrg</strong></td>
              <td>VARCHAR(10)</td>
              <td>TVKO-VKORG</td>
              <td>Organização de vendas parametrizada no SAP. Ex: 1010, 1020.</td>
            </tr>
            <tr>
              <td><strong>costCenter</strong></td>
              <td>VARCHAR(20)</td>
              <td>CSKS-KOSTL</td>
              <td>Código do Centro de Custo SAP associado para absorção de despesas.</td>
            </tr>
            <tr>
              <td><strong>profitCenter</strong></td>
              <td>VARCHAR(20)</td>
              <td>CEPC-PRCTR</td>
              <td>Código do Centro de Lucro SAP associado para atribuição de margem.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- PÁGINA 7: CAPÍTULO 4 -->
      <div class="page-break"></div>
      <div class="page">
        <h1>4. Especificação de APIs OData e Fluxos de Sincronização ERP</h1>
        <h2>4.1 Arquitetura de Barramento de Dados (Web Portal ↔ SAP Cloud)</h2>
        <p>A comunicação lúdica e de transações lógicas entre o Portal de Projetos da Exed e o SAP S/4HANA Cloud é efetuada através de chamadas síncronas RESTful empregando o protocolo **SAP OData v2/v4**. A camada do servidor corporativo encapsula as chamadas de API, ocultando chaves de acesso privadas, e expõe barramentos internos assíncronos que alimentam de forma reativa a central de notificações do header do portal.</p>
        <div class="note-box">
          <strong>Regra Geral de Comunicação Segura:</strong> Todos os pacotes são transmitidos usando certificados TLS 1.3 de ponta a ponta. A autenticação baseia-se em OAuth 2.0 Client Credentials armazenado na nuvem segura, exigindo credenciais rotativas semestralmente.
        </div>

        <h2>4.2 Endpoints OData Mapeados para Integrações Ativas</h2>
        
        <h3>Serviço 1: Criação de Business Partner (Cenário de Comunicação SAP_COM_0008)</h3>
        <p>Executado quando o Financeiro aprova a solicitação cadastral do Comercial. Cria de forma síncrona o cliente no cadastro mestre do SAP S/4HANA.</p>
        <pre>POST https://{S4_HOST}/sap/opu/odata/sap/API_BUSINESS_PARTNER/A_BusinessPartner
Content-Type: application/json
Accept: application/json
Authorization: Bearer [OAuth_Token]

{
  "BusinessPartnerCategory": "2",
  "BusinessPartnerFullName": "Ball Metalic Packaging S.A.",
  "OrganizationBPName1": "Ball México",
  "SearchTerm1": "BALLMEX",
  "TaxNumber1": "12345678000199"
}</pre>
        <p><strong>Resposta de Sucesso (201 Created):</strong> Retorna o código oficial SAP em <code>d.BusinessPartner</code> (ex: <code>0010049281</code>), persistido automaticamente na base local do portal, mudando o status do cliente de 'PENDING' para 'APPROVED'.</p>

        <h3>Serviço 2: Provisionamento de Projetos Comerciais (Cenário de Comunicação SAP_COM_0308)</h3>
        <p>Para cada moeda ativa preenchida pelo Financeiro na ficha técnica, o sistema dispara uma requisição individual de criação de projeto comercial oficial no SAP, garantindo a correspondência fiscal exata.</p>
        <pre>POST https://{S4_HOST}/sap/opu/odata/sap/API_COMMERCIAL_PROJECT_SRV/CommercialProjectSet
Content-Type: application/json

{
  "ProjectID": "PRJ-S4-2026-004-USD",
  "ProjectName": "S4 Public Braskem (USD)",
  "CustomerID": "0010049281",
  "ProjectManager": "Ana Silva",
  "StartDate": "2026-08-01T00:00:00",
  "EndDate": "2027-02-28T00:00:00",
  "SalesOrganization": "1010",
  "CostCenter": "CC-IND-01",
  "ProfitCenter": "PC-S4-GP"
}</pre>
      </div>

      <!-- PÁGINA 8: CAPÍTULO 4 - CONTINUAÇÃO -->
      <div class="page-break"></div>
      <div class="page">
        <h1>4. Especificação de APIs OData e Fluxos (Parte 2)</h1>
        
        <h3>Serviço 3: Criação de Projeto de Pré-Vendas Espelho (Cenário de Comunicação SAP_COM_0308)</h3>
        <p>Simultaneamente à criação do Projeto Comercial Operacional, o sistema provisiona de forma síncrona um projeto interno de pré-vendas espelho no SAP. Este projeto absorve horas comerciais e despesas despendidas por engenheiros de soluções antes do faturamento operacional iniciar.</p>
        <pre>POST https://{S4_HOST}/sap/opu/odata/sap/API_COMMERCIAL_PROJECT_SRV/CommercialProjectSet
Content-Type: application/json

{
  "ProjectID": "PV-S4-2026-004-USD",
  "ProjectName": "PV - S4 Public Braskem (USD)",
  "ProjectCategory": "INTERNAL_PRE_SALES",
  "CostCenter": "CC-PRE-SALES-101-USD",
  "StartDate": "2026-08-01T00:00:00"
}</pre>
        <p><strong>Fórmula de Provisionamento Físico de Linhas no SAP S/4HANA:</strong><br>
        O Portal aplica uma regra transacional inteligente ("Multi-Currency Transactional Loop") que otimiza de forma radical o esforço humano. Para cada solicitação unificada de projeto aprovada pelo PMO Corporativo, o barramento realiza:</p>
        <div style="background-color: #f8fafc; padding: 15px; border-radius: 6px; border: 1px solid #e2e8f0; font-family: 'JetBrains Mono', monospace; font-size: 9pt; margin-bottom: 15px;">
          N_Projetos_Físicos = 1 (Comercial Base BRL) + 1 (Pré-Vendas Base BRL) + (N_Moedas_Espelho_Ativas * 2)
        </div>
        <p>Exemplo Prático: Um projeto aprovado que contenha Moeda Base (BRL) e duas Moedas Estrangeiras Espelho adicionais (USD e EUR) resultará no provisionamento automático síncrono de **6 Projetos Físicos Individuais** no ERP SAP S/4HANA Cloud em menos de 2 segundos.</p>
        
        <h2>4.3 Fluxograma Sequencial de Eventos (Sequence Diagram)</h2>
        <div style="border: 1px solid #cbd5e1; padding: 15px; border-radius: 6px; background-color: #f8fafc; font-family: 'JetBrains Mono', monospace; font-size: 8pt; line-height: 1.4; overflow-x: auto;">
          [COMERCIAL/SOLICITANTE] --(1. Solicita Projeto + Moedas)--> [PORTAL DE PROJETOS]
                                                                        |
          [FINANCEIRO/VALIDADOR]  <--(2. Preenche chaves CO/FI)-- [Aguardando Parametrização]
                                  --(3. Confirma dados de moedas)-->    |
                                                                        |
          [PMO CORPORATIVO]       <--(4. Notificado para Aprovação)--   |
                                  --(5. CLIQUE EM APROVAR UNIFICADO)--> |
                                                                        |
                                  [LOOP TRANSACIONAL ODTA SAP] <--------|
                                  |-- Para cada Moeda Ativa:
                                  |   |-- (6. POST API_BUSINESS_PARTNER) -> [SAP S/4HANA Cloud]
                                  |   |-- (7. POST Comercial Project) ----> [SAP S/4HANA Cloud]
                                  |   |-- (8. POST Pré-Vendas Project) ---> [SAP S/4HANA Cloud]
                                  |
                                  v
          [PORTAL DE PROJETOS] --(9. Notifica Sucesso no Header)--------> [Telas do Usuário]
        </div>
      </div>

      <!-- PÁGINA 9: CAPÍTULO 5 -->
      <div class="page-break"></div>
      <div class="page">
        <h1>5. Detalhes Técnicos e Regras de Negócio de cada Aba</h1>
        <h2>5.1 Aba 01: Dashboard Estratégico</h2>
        <p><strong>Atores envolvidos:</strong> Todos os perfis (Visões adaptadas).</p>
        <p><strong>O que o Usuário Faz:</strong> O usuário acessa a tela principal e visualiza o panorama global de projetos e clientes. Pode selecionar filtros dinâmicos de Solução SAP (RISE, GROW, SCE), Gerente de Projetos responsável, ou realizar busca direta textual por cliente.</p>
        <p><strong>O que o Sistema Faz:</strong> Varre a base do banco de dados (<code>localStorage</code> em ambiente offline / BD Cloud em produção), calcula dinamicamente os valores dos KPIs do topo da tela, renderiza gráficos de rosca para distribuição de produtos SAP e gráficos de barras empilhadas para andamento dos status dos projetos na fila de provisionamento.</p>
        <p><strong>Influências:</strong> Se um projeto é aprovado pelo PMO Corporativo ou se o Financeiro altera moedas ativas, as informações do dashboard sofrem atualização reativa ("Live Update") em tempo real, refletindo perfeitamente o pipeline operacional.</p>

        <h2>5.2 Aba 02: Cadastro de Novo Cliente (Se novo)</h2>
        <p><strong>Atores envolvidos:</strong> Solicitante Comercial (Gera requisição) e Financeiro (Valida e Sincroniza).</p>
        <p><strong>O que o Usuário Faz:</strong> O Comercial insere a Razão Social do cliente, o CNPJ de 14 dígitos, o País de origem tributária e anotações explicativas. O Financeiro visualiza a fila de solicitações pendentes de validação, consulta os órgãos fiscais e insere o código numérico gerado no SAP S/4HANA após auditoria, clicando no botão "Sincronizar SAP".</p>
        <p><strong>O que o Sistema Faz:</strong> Valida se o CNPJ possui os 14 dígitos regulamentares e se não há duplicidades na base relacional. Após o clique do Financeiro em "Sincronizar", o portal despacha o payload OData correspondente, ativa o cliente localmente de forma automatizada e notifica a frente comercial.</p>

        <h2>5.3 Aba 03: Solicitação de Cadastro de Projeto</h2>
        <p><strong>Atores envolvidos:</strong> Comercial (Preenchimento), Financeiro (CO/FI) e PMO (Aprovação Unificada).</p>
        <p><strong>O que o Usuário Faz:</strong> O Comercial insere o escopo comercial do projeto, escolhe o cliente (já aprovado) e seleciona na listagem dinâmica quais **moedas estrangeiras espelho** deseja associar. O Financeiro acessa a mesma ficha e insere chaves específicas de Organizações de Vendas, Centros de Custo e Centros de Lucro exclusivas para cada moeda selecionada pelo Comercial. O PMO Corporativo revisa o pacote completo unificado e clica em "Aprovar Projeto".</p>
        <p><strong>O que o Sistema Faz:</strong> Agrupa as variáveis inseridas em uma única estrutura transacional aninhada. Multiplica os projetos lógicos na base com base no número de moedas ativas cadastradas na ficha, gerando códigos unificados SAP e disparando sequencialmente as criações físicas de projeto comercial e pré-vendas via OData no SAP.</p>
      </div>

      <!-- PÁGINA 10: CAPÍTULO 5 - CONTINUAÇÃO -->
      <div class="page-break"></div>
      <div class="page">
        <h1>5. Detalhes Técnicos e Regras de Negócio (Parte 2)</h1>
        
        <h2>5.4 Aba 04: Lista Mestre e Governança de Encerramento</h2>
        <p><strong>Atores envolvidos:</strong> PM de Governança, Comercial e PMO Corporativo.</p>
        <p><strong>O que o Usuário Faz:</strong> Os usuários visualizam a grid contendo todos os registros de projetos lógicos ativos.
          <ul>
            <li><strong>Fluxo de Solicitação de Encerramento:</strong> O Comercial ou PM de Governança pode clicar na ação "Solicitar Encerramento" no final de uma linha, digitar uma justificativa operacional formal e submeter o pedido.</li>
            <li><strong>Fluxo de Aprovação de Encerramento:</strong> O PMO Corporativo visualiza as linhas sinalizadas com o status especial "PENDING_CLOSURE". Ele analisa a justificativa apresentada e clica em "Confirmar Encerramento Operacional".</li>
            <li><strong>Painel de Edição Direta de Células:</strong> O PMO Corporativo pode habilitar a "Chave de Segurança do Administrador" para destravar a planilha de dados e editar diretamente valores de chaves de custos, códigos SAP, nomes ou gerentes clicando diretamente nas células.</li>
          </ul>
        </p>
        <p><strong>O que o Sistema Faz:</strong>
          <ul>
            <li>Na solicitação de encerramento, o sistema atualiza o status local para reter o histórico e encaminha a notificação para a fila do PMO.</li>
            <li>Na aprovação do encerramento pelo PMO, o portal muda o status definitivo para "CLOSED", bloqueando edições, retendo a linha para relatórios de histórico de faturamento sem deletá-la fisicamente do banco de dados e dispara a chamada de API de encerramento lógico no SAP S/4HANA.</li>
            <li>Na Edição Direta, o sistema aplica um controle rígido de sanidade cadastral para impedir inserção de dados vazios ou caracteres inválidos nas chaves CO/FI estruturadas.</li>
          </ul>
        </p>

        <h2>5.5 Aba 05: Configuração Cambial e Cadastro de Moedas</h2>
        <p><strong>Atores envolvidos:</strong> Financeiro (Responsável) e PMO Corporativo (Consultado).</p>
        <p><strong>O que o Usuário Faz:</strong> O Financeiro acessa o menu de parametrização monetária do portal. Ele pode preencher o formulário para adicionar novas moedas espelho, preenchendo o código ISO correspondente de 3 dígitos, o nome descritivo, o símbolo gráfico, a taxa de conversão atualizada em relação à moeda base BRL e o status operacional ativo.</p>
        <p><strong>O que o Sistema Faz:</strong> Valida se o código de 3 caracteres já não consta na base corporativa. Ao registrar a moeda, o sistema atualiza de forma reativa os seletores multimoeda da Aba 03 de Ficha de Projetos, permitindo que as novas propostas comerciais já incorporem as opções cadastradas em tempo real.</p>
      </div>

      <!-- PÁGINA 11: CAPÍTULO 6 -->
      <div class="page-break"></div>
      <div class="page">
        <h1>6. Mecanismo Cambial e Projetos Espelhos</h1>
        <h2>6.1 Fluxo Físico de Multiplicação de Projetos Cambiais no SAP</h2>
        <p>Uma das regras de negócio mais valiosas do portal da Exed Consulting é a capacidade de realizar o provisionamento físico de projetos espelhados com base nas moedas selecionadas pelo solicitante da área comercial.</p>
        <p>Historicamente, a contratação de projetos internacionais gerava complexidades financeiras extremas, pois os consultores apontam horas trabalhadas na moeda estrangeira correspondente, mas o faturamento geral ocorre em Real (BRL) baseado nas flutuações e taxas cambiais acordadas contratualmente.</p>
        <p>O Portal de Projetos automatiza essa relação de espelhamento estrutural de ponta a ponta. Quando o solicitante do comercial seleciona múltiplos escopos cambiais adicionais (ex: USD e EUR) além da moeda base do faturamento principal (BRL), o portal do projeto gera uma ficha transacional integrada.</p>
        
        <h2>6.2 Arquitetura de Faturamento Cambial Espelhado</h2>
        <p>No ERP SAP S/4HANA Cloud, um único projeto físico aceita apenas uma moeda transacional principal declarada no cabeçalho do registro de WBS (Work Breakdown Structure). Para resolver essa restrição, o Portal provisiona de forma agrupada e inteligente:</p>
        <ul>
          <li><strong>Projeto Principal (Moeda Base BRL):</strong> Destinado ao faturamento comercial principal da Exed Consulting no Brasil, consolidando os tributos domésticos e relatórios fiscais do grupo.</li>
          <li><strong>Projeto Espelho Comercial USD (Se selecionado):</strong> Provisionado com parametrizações contábeis exclusivas para os EUA, permitindo que a subsidiária americana aponte horas, gerencie despesas de viagens e atue no hedge cambial correspondente ao contrato.</li>
          <li><strong>Projeto Espelho Comercial EUR (Se selecionado):</strong> Provisionado com parametrizações contábeis exclusivas para a Europa, unificando taxas de conversão específicas acordadas com o cliente europeu.</li>
        </ul>
        <p>Além dos projetos comerciais principais de faturamento, o portal cria para cada moeda ativa os respectivos <strong>Projetos de Pré-Vendas</strong> correspondentes, isolando o consumo de horas e despesas administrativas internas pré-operacionais.</p>
        
        <h2>6.3 Algoritmo de Cálculo de Conversão em Tempo Real no Frontend</h2>
        <p>Para fornecer feedbacks visuais eficientes ao usuário comercial durante a montagem do escopo, o sistema utiliza as taxas de câmbio ativas cadastradas pelo Financeiro para calcular estimativas lógicas de conversão direta:</p>
        <pre>// Função de conversão do sistema
export function convertCurrency(amountInForeignCurrency: number, foreignCurrencyCode: string, currencies: Currency[]): number {
  const currency = currencies.find(c => c.code === foreignCurrencyCode);
  if (!currency || !currency.isActive) {
    return amountInForeignCurrency; // Retorna o valor original se não encontrar moeda cadastrada
  }
  return amountInForeignCurrency * currency.conversionRateToBaseBrl;
}</pre>
      </div>

      <!-- PÁGINA 12: CAPÍTULO 7 -->
      <div class="page-break"></div>
      <div class="page">
        <h1>7. Segurança, Rastreabilidade (Audit Logs) e Conformidade SOX</h1>
        <h2>7.1 Modelo de Segurança e Governança Corporativa</h2>
        <p>Como portal focado na integração com o ERP S/4HANA Cloud, que gerencia os dados financeiros e contábeis vitais da Exed Consulting, o sistema é projetado sob os mais rigorosos padrões de segurança de engenharia de software corporativo:</p>
        <ul>
          <li><strong>Princípio do Menor Privilégio (PoLP):</strong> Nenhum usuário detém privilégios operacionais que extrapolem sua alçada definida na matriz RACI. O Comercial está fisicamente bloqueado de visualizar ou preencher chaves CO/FI, e o Financeiro está bloqueado de autorizar de forma unilateral a criação de projetos sem o crivo do PMO Corporativo.</li>
          <li><strong>Proteção Contra Ingressos e Injeções de Dados (XSS/SQLi):</strong> Todas as entradas textuais dos formulários são limpas e validadas por expressões regulares robustas no frontend e backend antes de qualquer submissão de payload para as APIs OData do SAP.</li>
        </ul>

        <h2>7.2 Imutabilidade e Governança de Logs de Auditoria (SOX Audit Trail)</h2>
        <p>A Lei Sarbanes-Oxley (SOX) impõe requisitos rigorosos de auditoria em sistemas que influenciam relatórios financeiros de grandes corporações. Para garantir total conformidade, o portal possui um motor de persistência de **Audit Logs imutáveis**.</p>
        <p>Sempre que o PMO Corporativo realiza alterações críticas - tais como editar diretamente valores de chaves financeiras na planilha mestre utilizando a ferramenta de edição de célula ou aprovando o arquivamento definitivo de projetos - o sistema grava automaticamente uma linha inviolável na base de logs lógicos de auditoria:</p>
        
        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>ID Usuário</th>
              <th>Nome do Usuário</th>
              <th>Ação Efetuada</th>
              <th>Entidade Afetada</th>
              <th>Valores (Antes → Depois)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>14/07/2026 10:14</td>
              <td>user-8</td>
              <td>Ricardo Souza (PMO)</td>
              <td>UPDATE_CELL_DIRECT</td>
              <td>PRJ-S4-GROW-PETROBRAS</td>
              <td>CostCenter: CC-DEV-01 → CC-PETRO-99</td>
            </tr>
            <tr>
              <td>13/07/2026 15:30</td>
              <td>user-8</td>
              <td>Ricardo Souza (PMO)</td>
              <td>APPROVE_PROJECT_CLOSURE</td>
              <td>PRJ-S4-GROW-AMS-SUPPORT</td>
              <td>Status: APPROVED → CLOSED (Operacional)</td>
            </tr>
            <tr>
              <td>12/07/2026 09:45</td>
              <td>user-3</td>
              <td>Fernanda Lima (Finanças)</td>
              <td>UPDATE_CURRENCY_RATE</td>
              <td>CURR-USD</td>
              <td>Rate: 5.40 BRL → 5.45 BRL</td>
            </tr>
            <tr>
              <td>11/07/2026 11:20</td>
              <td>user-8</td>
              <td>Ricardo Souza (PMO)</td>
              <td>DELETE_PROJECT_ROW</td>
              <td>PRJ-S4-TIME-MOCK-TEST</td>
              <td>Remoção de registro órfão de teste da grid.</td>
            </tr>
          </tbody>
        </table>
        <p><strong>Rastreabilidade Imutável:</strong> Os logs gravados no portal de auditoria técnica são read-only e não possuem canais de exclusão física na interface de desenvolvimento, impedindo a manipulação de dados em caso de incidentes operacionais.</p>
        
        <h2>7.3 Requisitos Não-Funcionais e Compliance (LGPD, Volumetria e Deploy)</h2>
        <p>Abaixo estão detalhadas as diretrizes de compliance regulatório e engenharia não-funcional essenciais para homologação de infraestrutura do Portal:</p>
        <ul>
          <li><strong>Volumetria e Escala Mensal:</strong> O sistema é dimensionado e otimizado para gerenciar uma volumetria mensal estimada de <strong>50 a 100 novos projetos comerciais/pré-vendas</strong> lúdicos cadastrados, além de cerca de <strong>20 novos cadastros de Parceiros de Negócios (clientes)</strong> mensais. A arquitetura de dados e as chamadas proxy SAP estão prontas para picos de concorrência típicos de fechamento mensal.</li>
          <li><strong>Ambiente de Deploy (Produção):</strong> A aplicação está estruturada para execução estável em contêineres Docker robustos hospedados sob o <strong>Google Cloud Run</strong> ou <strong>Microsoft Azure Container Apps</strong> com auto-scaling ativado. Opcionalmente, pode ser orquestrada integrada ao <strong>SAP BTP Integration Suite</strong> para segurança e telemetria avançada de barramento.</li>
          <li><strong>LGPD e Segurança de Dados:</strong> O sistema implementa o princípio do menor privilégio (PoLP) de forma sistêmica, com criptografia de ponta a ponta (HTTPS/TLS 1.3 em trânsito, AES-256 em repouso) e mascaramento automático de dados cadastrais e bancários sensíveis. Atende estritamente às exigências da <strong>Lei Geral de Proteção de Dados (LGPD)</strong>, com gerenciamento controlado de termos de consentimento, rastreabilidade técnica e mecanismos de exclusão lógica segura de dados órfãos de contatos comerciais.</li>
        </ul>
      </div>

      <!-- PÁGINA 13: CAPÍTULO 8 - MOCKUPS DE TELA -->
      <div class="page-break"></div>
      <div class="page">
        <h1>8. Catálogo Visível de Mockups do Aplicativo (Telas Abertas & Fechadas)</h1>
        <p style="margin-bottom: 20px;">Esta seção apresenta representações em fidelidade pixel-perfect de todas as telas lógicas e estados do aplicativo, documentando visualmente o comportamento para os desenvolvedores e homologadores.</p>

        <h2>Mockup 01: Dashboard Estratégico de BI (Painel de KPIs Gerais)</h2>
        <div class="mockup-header">
          <span>TELA 01: DASHBOARD PRINCIPAL - TEMA CLARO Padrão</span>
          <span>ESTADO: MENU PRINCIPAL RECOLHIDO</span>
        </div>
        <div class="mockup-body">
          <div class="mockup-app-layout">
            <div class="mockup-sidebar">
              <div class="mockup-sidebar-logo">EXED<span>S/4 Portal</span></div>
              <div class="mockup-nav-item active">📊 Dashboard</div>
              <div class="mockup-nav-item">🏢 Novo Cliente</div>
              <div class="mockup-nav-item">💼 Nova Ficha</div>
              <div class="mockup-nav-item">📋 Lista Mestre</div>
              <div class="mockup-nav-item">🪙 Câmbio Finanças</div>
            </div>
            <div class="mockup-content">
              <div class="mockup-app-header">
                <span style="font-weight: bold; font-size: 10px; color: #1e293b;">DASHBOARD EXECUTIVO</span>
                <div class="mockup-user-badge">
                  <span>Ricardo Souza</span><span class="mockup-badge-role">[PMO Corporativo]</span>
                </div>
              </div>
              <div class="mockup-grid-kpi">
                <div class="mockup-kpi-card">
                  <span class="mockup-kpi-title">Projetos Totais</span>
                  <span class="mockup-kpi-value">48</span>
                </div>
                <div class="mockup-kpi-card">
                  <span class="mockup-kpi-title">Pend. Finanças</span>
                  <span class="mockup-kpi-value">4</span>
                </div>
                <div class="mockup-kpi-card">
                  <span class="mockup-kpi-title">Pend. PMO</span>
                  <span class="mockup-kpi-value">2</span>
                </div>
                <div class="mockup-kpi-card">
                  <span class="mockup-kpi-title">SAP Sincronizados</span>
                  <span class="mockup-kpi-value">42</span>
                </div>
              </div>
              <div class="mockup-card">
                <span class="mockup-card-title">Resumo do Pipeline do Semestre</span>
                <div style="height: 100px; border: 1px dashed #cbd5e1; border-radius: 4px; display: flex; align-items: center; justify-content: center; color: #94a3b8; font-size: 8px;">
                  [GRÁFICO VETORIAL DE LINHAS - DISTRIBUIÇÃO E CONVERSÃO CAMBIAL EM BRL]
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PÁGINA 14: MOCKUPS DE TELA PARTE 2 -->
      <div class="page-break"></div>
      <div class="page">
        <h1>8. Catálogo Visível de Mockups do Aplicativo (Parte 2)</h1>
        
        <h2>Mockup 02: Central de Notificações Ativa (Menu do Header Aberto)</h2>
        <div class="mockup-header">
          <span>TELA 01.1: HEADER GERAL - TEMA CLARO</span>
          <span>ESTADO: MENU DROPDOWN DE NOTIFICAÇÕES SELECIONADO (ABERTO)</span>
        </div>
        <div class="mockup-body">
          <div class="mockup-app-layout" style="min-height: 250px;">
            <div class="mockup-sidebar">
              <div class="mockup-sidebar-logo">EXED<span>S/4 Portal</span></div>
              <div class="mockup-nav-item active">📊 Dashboard</div>
              <div class="mockup-nav-item">🏢 Novo Cliente</div>
            </div>
            <div class="mockup-content">
              <div class="mockup-app-header">
                <span style="font-weight: bold; font-size: 10px; color: #1e293b;">DASHBOARD EXECUTIVO</span>
                <div style="display: flex; gap: 10px; align-items: center;">
                  <div style="background-color: #3b82f6; color: #ffffff; padding: 3px 6px; border-radius: 50%; font-size: 7px; font-weight: bold; cursor: pointer;">
                    🔔 2
                  </div>
                  <div class="mockup-user-badge">
                    <span>Ricardo Souza</span><span class="mockup-badge-role">[PMO Corporativo]</span>
                  </div>
                </div>
              </div>
              <p style="font-size: 8px; color: #64748b;">Conteúdo do painel principal minimizado em segundo plano sob o dropdown ativo.</p>
            </div>
          </div>
          <!-- DROPDOWN DE NOTIFICAÇÕES VISÍVEL NO MOCKUP -->
          <div class="mockup-notif-dropdown" style="top: 50px; right: 45px;">
            <div class="mockup-notif-header">
              <span>Notificações SAP S/4HANA</span>
              <span style="color: #2563eb; cursor: pointer;">Marcar lidas</span>
            </div>
            <div class="mockup-notif-item unread">
              <strong>Novo cliente solicitado:</strong> Ball México aguarda validação cambial no SAP.<br>
              <span style="color: #94a3b8; font-size: 6px;">Hoje</span>
            </div>
            <div class="mockup-notif-item unread">
              <strong>Nova moeda habilitada:</strong> CHF cadastrada pelo Financeiro com taxa 5.92 BRL.<br>
              <span style="color: #94a3b8; font-size: 6px;">Hoje</span>
            </div>
            <div class="mockup-notif-item">
              <strong>Projeto aprovado:</strong> S4 Implementation Braskem com chaves SAP criadas.<br>
              <span style="color: #94a3b8; font-size: 6px;">Ontem</span>
            </div>
          </div>
        </div>

        <h2>Mockup 03: Cadastro de Clientes com Retorno do OData SAP (Sucesso)</h2>
        <div class="mockup-header">
          <span>TELA 02: CADASTRO DE CLIENTE - TEMA EXED (Burgundy)</span>
          <span>ESTADO: FORMULÁRIO ENVIADO COM SUCESSO E CÓDIGO SAP GERADO</span>
        </div>
        <div class="mockup-body">
          <div class="mockup-app-layout" style="min-height: 250px;">
            <div class="mockup-sidebar" style="background-color: #3b0d16;"> <!-- Burgundy Sidebar -->
              <div class="mockup-sidebar-logo">EXED<span>S/4 Portal</span></div>
              <div class="mockup-nav-item">📊 Dashboard</div>
              <div class="mockup-nav-item active-exed">🏢 Novo Cliente</div>
              <div class="mockup-nav-item">💼 Nova Ficha</div>
            </div>
            <div class="mockup-content">
              <div class="mockup-app-header">
                <span style="font-weight: bold; font-size: 10px; color: #1e293b; text-transform: uppercase;">Registro de Parceiro de Negócio (Cliente)</span>
                <div class="mockup-user-badge">
                  <span>Fernanda Lima</span><span class="mockup-badge-role" style="color: #6b1d2f;">[Financeiro]</span>
                </div>
              </div>
              <div class="success-box" style="font-size: 8px; padding: 6px 10px; margin-bottom: 8px;">
                <strong>Sucesso de Integração SAP!</strong> O cliente <strong>Ball México</strong> foi registrado com sucesso no SAP S/4HANA sob o código oficial <strong>0010049281</strong> via serviço <code>API_BUSINESS_PARTNER</code>.
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <div class="mockup-form-group">
                  <span class="mockup-label">Razão Social do Parceiro</span>
                  <input class="mockup-input" type="text" value="Ball Metalic Packaging S.A." disabled>
                </div>
                <div class="mockup-form-group">
                  <span class="mockup-label">CNPJ Oficial</span>
                  <input class="mockup-input" type="text" value="12.345.678/0001-99" disabled>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2>Mockup 03.1: Nova Solicitação de Projeto (Aba do Comercial / Cadastro Projeto)</h2>
        <div class="mockup-header">
          <span>TELA 02.1: CADASTRO DE PROJETO - SOLICITANTE COMERCIAL</span>
          <span>ESTADO: PREENCHIMENTO E SELEÇÃO DE MOEDAS ESTRANGEIRAS ESPELHOS</span>
        </div>
        <div class="mockup-body">
          <div class="mockup-app-layout" style="min-height: 280px;">
            <div class="mockup-sidebar">
              <div class="mockup-sidebar-logo">EXED<span>S/4 Portal</span></div>
              <div class="mockup-nav-item">📊 Dashboard</div>
              <div class="mockup-nav-item">🏢 Novo Cliente</div>
              <div class="mockup-nav-item active">💼 Novo Projeto</div>
            </div>
            <div class="mockup-content">
              <div class="mockup-app-header">
                <span style="font-weight: bold; font-size: 10px; color: #1e293b; text-transform: uppercase;">Abertura de Oportunidade / Projeto S/4</span>
                <div class="mockup-user-badge">
                  <span>Lucas Oliveira</span><span class="mockup-badge-role" style="color: #10b981;">[Comercial]</span>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                <div class="mockup-form-group">
                  <span class="mockup-label">Nome do Projeto Comercial</span>
                  <input class="mockup-input" type="text" value="S4 Public Implementation Braskem" disabled>
                </div>
                <div class="mockup-form-group">
                  <span class="mockup-label">Parceiro de Negócios (Cliente)</span>
                  <select class="mockup-select" disabled>
                    <option>Braskem S.A. (0010049281)</option>
                  </select>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 8px; margin-top: 4px;">
                <div class="mockup-form-group">
                  <span class="mockup-label">Solução SAP Contratada</span>
                  <input class="mockup-input" type="text" value="RISE with SAP" disabled>
                </div>
                <div class="mockup-form-group">
                  <span class="mockup-label">Modelo Comercial</span>
                  <input class="mockup-input" type="text" value="Time & Material" disabled>
                </div>
                <div class="mockup-form-group">
                  <span class="mockup-label">Moedas Estrangeiras Espelho</span>
                  <div style="display: flex; gap: 4px; align-items: center; margin-top: 2px;">
                    <span style="background-color: #2563eb; color: white; padding: 2px 4px; border-radius: 3px; font-size: 7px; font-weight: bold;">USD (Dólar)</span>
                    <span style="background-color: #2563eb; color: white; padding: 2px 4px; border-radius: 3px; font-size: 7px; font-weight: bold;">EUR (Euro)</span>
                  </div>
                </div>
              </div>
              <p style="font-size: 7px; color: #10b981; font-weight: bold; margin-top: 5px; margin-bottom: 0;">✓ Proposta salva! Notificação automática enviada à equipe de Finanças para validação cambial e preenchimento de chaves CO/FI.</p>
            </div>
          </div>
        </div>
      </div>

      <!-- PÁGINA 15: MOCKUPS DE TELA PARTE 3 -->
      <div class="page-break"></div>
      <div class="page">
        <h1>8. Catálogo Visível de Mockups do Aplicativo (Parte 3)</h1>
        
        <h2>Mockup 04: Ficha de Projetos - Preenchimento de Chaves CO/FI pelo Financeiro</h2>
        <div class="mockup-header">
          <span>TELA 03: CADASTRO DE PROJETO - TEMA ESCURO (Dark Mode)</span>
          <span>ESTADO: ÁREA DO FINANCEIRO DE CHAVES DE CONTABILIDADE POR MOEDA ABERTA</span>
        </div>
        <div class="mockup-body" style="background-color: #0f172a; border-color: #1e293b;">
          <div class="mockup-app-layout" style="background-color: #1e293b; border-color: #334155; min-height: 320px;">
            <div class="mockup-sidebar" style="background-color: #0f172a;">
              <div class="mockup-sidebar-logo">EXED<span>S/4 Portal</span></div>
              <div class="mockup-nav-item">📊 Dashboard</div>
              <div class="mockup-nav-item">🏢 Novo Cliente</div>
              <div class="mockup-nav-item active" style="background-color: #2563eb;">💼 Nova Ficha</div>
            </div>
            <div class="mockup-content" style="color: #f1f5f9;">
              <div class="mockup-app-header" style="border-bottom-color: #334155;">
                <span style="font-weight: bold; font-size: 10px; color: #ffffff;">FICHA DE PROJETO INTEGRADA (MULTIMOEDAS)</span>
                <div class="mockup-user-badge" style="background-color: #0f172a; border-color: #334155; color: #f1f5f9;">
                  <span>Fernanda Lima</span><span class="mockup-badge-role" style="color: #3b82f6;">[Financeiro]</span>
                </div>
              </div>
              
              <div class="mockup-card" style="background-color: #0f172a; border-color: #334155; padding: 10px; margin-top: 5px;">
                <span class="mockup-card-title" style="color: #ffffff; font-size: 8px;">Configuração Contábil para Moeda Estrangeira: <strong>USD (Dólar Americano)</strong></span>
                <p style="font-size: 7.5px; color: #94a3b8; margin-bottom: 8px;">Insira os códigos estruturados CO/FI obtidos do SAP para as transações na moeda USD selecionada pelo Comercial.</p>
                <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
                  <div class="mockup-form-group">
                    <span class="mockup-label" style="color: #94a3b8;">Organização de Vendas SAP</span>
                    <input class="mockup-input" style="background-color: #1e293b; border-color: #334155; color: #ffffff; font-size: 7.5px;" value="1010 (SAP US)">
                  </div>
                  <div class="mockup-form-group">
                    <span class="mockup-label" style="color: #94a3b8;">Centro de Custo</span>
                    <input class="mockup-input" style="background-color: #1e293b; border-color: #334155; color: #ffffff; font-size: 7.5px;" value="CC-US-TIME-02">
                  </div>
                  <div class="mockup-form-group">
                    <span class="mockup-label" style="color: #94a3b8;">Centro de Lucro</span>
                    <input class="mockup-input" style="background-color: #1e293b; border-color: #334155; color: #ffffff; font-size: 7.5px;" value="PC-US-IMPLEMENT">
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2>Mockup 04.1: Homologação e Aprovação Geral PMO (Validação PMO)</h2>
        <div class="mockup-header">
          <span>TELA 03.1: PAINEL DE HOMOLOGAÇÃO PMO</span>
          <span>ESTADO: REVISÃO DE DIVISÃO MULTIMOEDAS E BOTÃO DE DISPARO DE LOTE ATIVO</span>
        </div>
        <div class="mockup-body">
          <div class="mockup-app-layout" style="min-height: 290px;">
            <div class="mockup-sidebar">
              <div class="mockup-sidebar-logo">EXED<span>S/4 Portal</span></div>
              <div class="mockup-nav-item">📊 Dashboard</div>
              <div class="mockup-nav-item active">📋 Homologação PMO</div>
            </div>
            <div class="mockup-content">
              <div class="mockup-app-header">
                <span style="font-weight: bold; font-size: 10px; color: #1e293b; text-transform: uppercase;">Validação de Divisão Cambial & Provisionamento</span>
                <div class="mockup-user-badge">
                  <span>Ricardo Souza</span><span class="mockup-badge-role" style="color: #6b1d2f;">[PMO Corporativo]</span>
                </div>
              </div>
              <div class="mockup-card" style="padding: 10px; border-color: #cbd5e1; background-color: #f8fafc;">
                <span style="font-size: 8px; font-weight: bold; color: #1e293b; display: block; margin-bottom: 4px;">Projeto: S4 Public Implementation Braskem</span>
                <div style="font-size: 7px; color: #475569;">
                  <strong>Cliente:</strong> Braskem S.A. | <strong>Gerente:</strong> Ana Silva | <strong>Solução SAP:</strong> RISE<br>
                  <strong>Estrutura Física a provisionar no SAP S/4HANA Cloud (Fórmula Transacional):</strong>
                  <ul style="margin: 4px 0; padding-left: 12px; font-size: 6.5px;">
                    <li>1. Projeto Comercial BRL (Base) + 1. Projeto Pré-Vendas BRL (Espelho)</li>
                    <li>2. Projeto Comercial USD (Cambial) + 2. Projeto Pré-Vendas USD (Espelho)</li>
                    <li>3. Projeto Comercial EUR (Cambial) + 3. Projeto Pré-Vendas EUR (Espelho)</li>
                  </ul>
                  <strong style="color: #6b1d2f;">Total de Projetos Físicos Individuais no S/4HANA: 6 Projetos</strong>
                </div>
              </div>
              <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 5px;">
                <button class="mockup-btn" style="background-color: #ef4444;">Rejeitar Proposta ✕</button>
                <button class="mockup-btn" style="background-color: #10b981;">Aprovar & Provisionar no SAP (6 Projetos) ✓</button>
              </div>
            </div>
          </div>
        </div>

        <h2>Mockup 05: Lista Mestre - Painel de Edição Direta de Células (PMO Corporativo)</h2>
        <div class="mockup-header">
          <span>TELA 04: LISTA MESTRE DE PROJETOS - TEMA CLARO Padrão</span>
          <span>ESTADO: CHAVE DE SEGURANÇA PMO ATIVA / PAINEL DE EDIÇÃO DIRETA EM EXIBIÇÃO</span>
        </div>
        <div class="mockup-body">
          <div class="mockup-app-layout" style="min-height: 290px;">
            <div class="mockup-sidebar">
              <div class="mockup-sidebar-logo">EXED<span>S/4 Portal</span></div>
              <div class="mockup-nav-item">📊 Dashboard</div>
              <div class="mockup-nav-item">📋 Lista Mestre</div>
            </div>
            <div class="mockup-content">
              <div class="mockup-app-header">
                <span style="font-weight: bold; font-size: 10px; color: #1e293b;">PLANILHA MESTRE DE PROJETOS ATIVOS</span>
                <span style="background-color: #fee2e2; color: #ef4444; padding: 2px 6px; border-radius: 4px; font-size: 7px; font-weight: bold;">🔓 MODO EDITOR ADMINISTRADOR ATIVO</span>
              </div>
              <table class="mockup-table">
                <thead>
                  <tr>
                    <th>Nome do Projeto</th>
                    <th>Gerente</th>
                    <th>Centro de Custo</th>
                    <th>Ações Mestre</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style="background-color: #eff6ff; border: 1.5px solid #3b82f6;">
                    <td style="font-weight: bold; color: #2563eb;">S4 Public Implementation Braskem</td>
                    <td>Ana Silva</td>
                    <td style="background-color: #fef08a;">CC-BR-S4-99 (Editando...)</td>
                    <td>
                      <span style="color: #16a34a; font-weight: bold; cursor: pointer; margin-right: 5px;">💾</span>
                      <span style="color: #dc2626; font-weight: bold; cursor: pointer;">❌</span>
                    </td>
                  </tr>
                  <tr>
                    <td>GROW support Ball Corp</td>
                    <td>Pedro Santos</td>
                    <td>CC-BR-AMS-01</td>
                    <td><span style="color: #475569; cursor: pointer;">✏️</span></td>
                  </tr>
                </tbody>
              </table>
              <div class="mockup-pmo-editor">
                <span style="font-weight: bold; font-size: 8px; color: #2563eb; display: block; margin-bottom: 4px;">Painel de Modificação de Emergência (Conformidade SOX)</span>
                <p style="font-size: 7px; color: #64748b; margin-bottom: 0;">Você está alterando células brutas do banco de dados. Esta transação registrará um log imutável no portal de auditoria técnica para aprovações futuras da equipe de segurança.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PÁGINA 16: MOCKUPS DE TELA PARTE 4 -->
      <div class="page-break"></div>
      <div class="page">
        <h1>8. Catálogo Visível de Mockups do Aplicativo (Parte 4)</h1>
        
        <h2>Mockup 05.1: Lista de Usuários e Simulação de Sessões (Lista de usuários)</h2>
        <div class="mockup-header">
          <span>TELA 04.1: CONTROLE DE USUÁRIOS - TEMA CLARO Padrão</span>
          <span>ESTADO: VISÃO ADMINISTRATIVA COM CHAVE DE ATIVAÇÃO DE SESSÃO RÁPIDA</span>
        </div>
        <div class="mockup-body">
          <div class="mockup-app-layout" style="min-height: 280px;">
            <div class="mockup-sidebar">
              <div class="mockup-sidebar-logo">EXED<span>S/4 Portal</span></div>
              <div class="mockup-nav-item">📊 Dashboard</div>
              <div class="mockup-nav-item active">👥 Usuários</div>
            </div>
            <div class="mockup-content">
              <div class="mockup-app-header">
                <span style="font-weight: bold; font-size: 10px; color: #1e293b; text-transform: uppercase;">Gerenciamento de Acessos & Sessões</span>
                <span style="background-color: #dbeafe; color: #1e40af; padding: 2px 6px; border-radius: 4px; font-size: 7px; font-weight: bold;">🔑 4 PERFIS DE SEGURANÇA MAPEADOS</span>
              </div>
              <table class="mockup-table">
                <thead>
                  <tr>
                    <th>Nome do Colaborador</th>
                    <th>E-mail Corporativo</th>
                    <th>Perfil de Acesso</th>
                    <th>Simulação de Sessão</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td style="font-weight: bold;">Ricardo Souza</td>
                    <td>ricardo.souza@exed.com.br</td>
                    <td><span style="background-color: #f3e8ff; color: #6b21a8; padding: 1px 4px; border-radius: 4px; font-size: 6.5px; font-weight: bold;">PMO Corporativo</span></td>
                    <td><span style="color: #64748b; font-size: 7px; font-style: italic;">Sessão Ativa (Você)</span></td>
                  </tr>
                  <tr>
                    <td>Fernanda Lima</td>
                    <td>fernanda.lima@exed.com.br</td>
                    <td><span style="background-color: #dbeafe; color: #1e40af; padding: 1px 4px; border-radius: 4px; font-size: 6.5px; font-weight: bold;">Financeiro / Adm.</span></td>
                    <td><button class="mockup-btn" style="padding: 2px 6px; font-size: 6.5px; background-color: #2563eb;">Simular 🎭</button></td>
                  </tr>
                  <tr>
                    <td>Lucas Oliveira</td>
                    <td>lucas.oliveira@exed.com.br</td>
                    <td><span style="background-color: #dcfce7; color: #15803d; padding: 1px 4px; border-radius: 4px; font-size: 6.5px; font-weight: bold;">Comercial</span></td>
                    <td><button class="mockup-btn" style="padding: 2px 6px; font-size: 6.5px; background-color: #2563eb;">Simular 🎭</button></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <h2>Mockup 06: Solicitação de Encerramento Operacional (Modal Ativo)</h2>
        <div class="mockup-header">
          <span>TELA 04.1: LISTA MESTRE DE PROJETOS - TEMA EXED (Burgundy)</span>
          <span>ESTADO: POPUP DE SOLICITAÇÃO DE ENCERRAMENTO COM JUSTIFICATIVA MANDATÓRIA</span>
        </div>
        <div class="mockup-body">
          <div class="mockup-app-layout" style="min-height: 280px; filter: blur(0.5px);">
            <div class="mockup-sidebar" style="background-color: #3b0d16;">
              <div class="mockup-sidebar-logo">EXED<span>S/4 Portal</span></div>
              <div class="mockup-nav-item">📊 Dashboard</div>
              <div class="mockup-nav-item">📋 Lista Mestre</div>
            </div>
            <div class="mockup-content">
              <div class="mockup-app-header">
                <span style="font-weight: bold; font-size: 10px; color: #1e293b;">PORTAL DE PROJETOS</span>
              </div>
              <p style="font-size: 8px; color: #64748b;">Conteúdo sob tela obscurecido pela sobreposição do modal administrativo ativo.</p>
            </div>
          </div>
          
          <!-- MODAL DE SOLICITAÇÃO DE ENCERRAMENTO SOBREPOSTO -->
          <div style="position: absolute; top: 70px; left: 100px; right: 100px; background-color: #ffffff; border: 1px solid #6b1d2f; border-radius: 8px; box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1); padding: 12px; z-index: 100;">
            <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #f1f5f9; padding-bottom: 6px; margin-bottom: 8px;">
              <span style="font-weight: bold; font-size: 8.5px; color: #6b1d2f;">Requerer Encerramento de Projeto Comercial</span>
              <span style="font-size: 8px; cursor: pointer; color: #94a3b8;">✕</span>
            </div>
            <div style="font-size: 7.5px; margin-bottom: 8px;">
              <strong>Projeto selecionado:</strong> <span style="color: #1e293b;">GROW Support Ball Corp (ID: PRJ-S4-GROW-102)</span>
            </div>
            <div class="mockup-form-group">
              <span class="mockup-label">Justificativa de Encerramento (MANDATÓRIA)</span>
              <textarea style="width: 100%; height: 40px; padding: 4px; border: 1px solid #cbd5e1; border-radius: 4px; font-size: 7.5px; font-family: sans-serif; resize: none;" placeholder="Descreva os motivos de faturamento completo ou rescisão contratual amigável..."></textarea>
            </div>
            <div style="text-align: right; margin-top: 8px;">
              <span style="background-color: #f1f5f9; color: #475569; padding: 4px 8px; border-radius: 4px; font-size: 7.5px; margin-right: 6px; cursor: pointer; display: inline-block;">Cancelar</span>
              <span class="mockup-btn-exed" style="padding: 4px 8px; cursor: pointer; display: inline-block;">Submeter Requisição PMO</span>
            </div>
          </div>
        </div>

        <h2>Mockup 07: Parametrização Cambial e Cadastro de Moedas (Aba do Financeiro)</h2>
        <div class="mockup-header">
          <span>TELA 05: CONFIGURAÇÃO CAMBIAL - TEMA CLARO Padrão</span>
          <span>ESTADO: LISTA DE MOEDAS ATIVAS E CADASTRO DE NOVO PARÂMETRO MONETÁRIO</span>
        </div>
        <div class="mockup-body">
          <div class="mockup-app-layout" style="min-height: 280px;">
            <div class="mockup-sidebar">
              <div class="mockup-sidebar-logo">EXED<span>S/4 Portal</span></div>
              <div class="mockup-nav-item">📊 Dashboard</div>
              <div class="mockup-nav-item active">🪙 Câmbio Finanças</div>
            </div>
            <div class="mockup-content">
              <div class="mockup-app-header">
                <span style="font-weight: bold; font-size: 10px; color: #1e293b;">MANUTENÇÃO DE MOEDAS CORPORATIVAS</span>
                <div class="mockup-user-badge">
                  <span>Fernanda Lima</span><span class="mockup-badge-role">[Financeiro]</span>
                </div>
              </div>
              <div style="display: grid; grid-template-columns: 140px 1fr; gap: 12px;">
                <div class="mockup-card" style="padding: 8px;">
                  <span class="mockup-card-title" style="font-size: 7.5px; margin-bottom: 4px;">Inserir Nova Moeda</span>
                  <div class="mockup-form-group">
                    <span class="mockup-label">Código ISO</span>
                    <input class="mockup-input" placeholder="Ex: GBP">
                  </div>
                  <div class="mockup-form-group">
                    <span class="mockup-label">Taxa Conversão</span>
                    <input class="mockup-input" placeholder="Ex: 7.12">
                  </div>
                  <span class="mockup-btn" style="width: 100%; text-align: center; padding: 4px 0; margin-top: 4px;">Cadastrar Parâmetro</span>
                </div>
                <div>
                  <table class="mockup-table">
                    <thead>
                      <tr>
                        <th>Moeda</th>
                        <th>Taxa (BRL)</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td><strong>USD</strong> (Dólar)</td>
                        <td>5.4500 BRL</td>
                        <td><span class="mockup-badge mockup-badge-active">ATIVO</span></td>
                      </tr>
                      <tr>
                        <td><strong>EUR</strong> (Euro)</td>
                        <td>5.9000 BRL</td>
                        <td><span class="mockup-badge mockup-badge-active">ATIVO</span></td>
                      </tr>
                      <tr>
                        <td><strong>CHF</strong> (Franco)</td>
                        <td>6.1200 BRL</td>
                        <td><span class="mockup-badge mockup-badge-closed">INATIVO</span></td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
        <h2>Mockup 07.1: Exportador PMO de Auditoria (Exportação)</h2>
        <div class="mockup-header">
          <span>TELA 05.1: PAINEL DE EXPORTAÇÃO PMO</span>
          <span>ESTADO: EXPORTAÇÃO DISPONÍVEL DE PLANILHAS E ESPECIFICAÇÃO</span>
        </div>
        <div class="mockup-body">
          <div class="mockup-app-layout" style="min-height: 280px;">
            <div class="mockup-sidebar">
              <div class="mockup-sidebar-logo">EXED<span>S/4 Portal</span></div>
              <div class="mockup-nav-item">📊 Dashboard</div>
              <div class="mockup-nav-item active">📤 Exportação PMO</div>
            </div>
            <div class="mockup-content">
              <div class="mockup-app-header">
                <span style="font-weight: bold; font-size: 10px; color: #1e293b; text-transform: uppercase;">Central de Exportação de Ativos</span>
                <span style="background-color: #f0fdf4; color: #16a54a; padding: 2px 6px; border-radius: 4px; font-size: 7px; font-weight: bold;">EXPORTAÇÃO CONFORME EXEDPADRÃO</span>
              </div>
              <p style="font-size: 7.5px; color: #475569;">Gere os artefatos oficiais do portal seguindo a regra estrita de nomenclatura unificada <strong>EXEDPORTAL_NOMEDODOCUMENTO</strong>.</p>
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 5px;">
                <div class="mockup-card" style="padding: 10px; text-align: center;">
                  <span style="font-size: 8px; font-weight: bold; color: #1b365d; display: block; margin-bottom: 4px;">Especificação Técnica Word</span>
                  <p style="font-size: 7px; color: #64748b; margin-bottom: 6px;">Documentação TO-BE estruturada com chaves e RACI.</p>
                  <button class="mockup-btn" style="padding: 4px 10px; font-size: 7px; background-color: #1b365d;">Baixar DOCX 📝</button>
                </div>
                <div class="mockup-card" style="padding: 10px; text-align: center;">
                  <span style="font-size: 8px; font-weight: bold; color: #6b1d2f; display: block; margin-bottom: 4px;">Especificação Técnica PDF</span>
                  <p style="font-size: 7px; color: #64748b; margin-bottom: 6px;">Manual técnico visual com todos os 11 mockups ricos.</p>
                  <button class="mockup-btn-exed" style="padding: 4px 10px; font-size: 7px;">Visualizar PDF 📄</button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <h2>Mockup 07.2: Diretrizes de Governança e Matriz de Acesso (Diretrizes de governança)</h2>
        <div class="mockup-header">
          <span>TELA 05.2: CONFIGURAÇÕES DE DIRETRIZES DE GOVERNANÇA</span>
          <span>ESTADO: SELEÇÃO DE POLÍTICAS DE ACESSO E CONFORMIDADE DE SEGURANÇA</span>
        </div>
        <div class="mockup-body">
          <div class="mockup-app-layout" style="min-height: 280px;">
            <div class="mockup-sidebar">
              <div class="mockup-sidebar-logo">EXED<span>S/4 Portal</span></div>
              <div class="mockup-nav-item">📊 Dashboard</div>
              <div class="mockup-nav-item active">🛡️ Governança</div>
            </div>
            <div class="mockup-content">
              <div class="mockup-app-header">
                <span style="font-weight: bold; font-size: 10px; color: #1e293b; text-transform: uppercase;">Políticas Globais de Acesso</span>
                <span style="background-color: #fef3c7; color: #92400e; padding: 2px 6px; border-radius: 4px; font-size: 7px; font-weight: bold;">🛡️ MATRIZ DE SEGURANÇA</span>
              </div>
              <div style="font-size: 7.5px; color: #475569; display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 5px;">
                <div class="mockup-card" style="padding: 8px;">
                  <strong>Regras de Restrição</strong>
                  <ul style="margin: 4px 0; padding-left: 10px; font-size: 6.5px;">
                    <li>Bloqueio de inserção direta CO/FI pelo Comercial</li>
                    <li>Sincronização SAP vinculada apenas a clientes homologados</li>
                    <li>Obrigatório CNPJ com 14 dígitos e máscara regulamentar</li>
                  </ul>
                </div>
                <div class="mockup-card" style="padding: 8px;">
                  <strong>Controle LGPD & Auditoria</strong>
                  <ul style="margin: 4px 0; padding-left: 10px; font-size: 6.5px;">
                    <li>Log imutável de todas as transações de modificação</li>
                    <li>Criptografia ativa em repouso (AES-256)</li>
                    <li>Procedimento de exclusão de registros de teste órfãos</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- PÁGINA 17: DIRETRIZES DE DESENVOLVIMENTO -->
      <div class="page-break"></div>
      <div class="page">
        <h1>9. Diretrizes de Desenvolvimento de Software</h1>
        <h2>9.1 Stack Tecnológica e Ferramental Recomendado</h2>
        <p>Para o desenvolvimento do portal de projetos lúdicos, a arquitetura deve seguir as premissas estritas de engenharia definidas abaixo:</p>
        <ul>
          <li><strong>Frontend:</strong> React 19 executado sob o empacotador rápido **Vite**. O controle de rotas lógicas e abas deve ser resolvido em estado dinâmico (componentes autocontidos) para evitar perdas de sessão ou recarregamento total da página.</li>
          <li><strong>Estilização Visual:</strong> **Tailwind CSS v4** utilitário direto. Nenhuma folha de estilo customizada ou bibliotecas pesadas de CSS-in-JS devem ser inseridas, preservando a leveza, tempos de carregamento instantâneos e facilidade de depuração.</li>
          <li><strong>Biblioteca de Ícones Corporativos:</strong> **Lucide-React** unificado. É expressamente proibida a criação de tags SVG inline espalhadas que dificultam a leitura e escalabilidade do código do portal.</li>
          <li><strong>Camada de Animação e Acessibilidade:</strong> **Motion** (importada de <code>motion/react</code>). Utilizada para fornecer feedbacks de micro-interações, tais como animação suave de entrada de modais, fade-in na transição de abas e pulsações visuais em processos de sincronização pendentes.</li>
          <li><strong>Persistência Local para Homologação:</strong> **Web Storage (localStorage)**. O sistema deve inicializar-se com dados de semente inteligentes (SEED_DATA) caso a base local esteja vazia, permitindo simular com perfeição todo o fluxo de ponta a ponta mesmo sem conexão com o servidor.</li>
        </ul>

        <h2>9.2 Pipeline de Integração Contínua e Deployment (CI/CD)</h2>
        <p>A arquitetura de infraestrutura "To-Be" recomenda o empacotamento da aplicação em contêineres Docker robustos executados em arquitetura de microsserviços sob o **Google Cloud Run**:</p>
        <pre># Exemplo conceitual de pipeline de publicação rápida (Cloud Build)
steps:
  # 1. Instalar dependências físicas
  - name: 'gcr.io/cloud-builders/npm'
    args: ['install']
  # 2. Executar linter estrutural de tipagem
  - name: 'gcr.io/cloud-builders/npm'
    args: ['run', 'lint']
  # 3. Compilar ativos estáticos
  - name: 'gcr.io/cloud-builders/npm'
    args: ['run', 'build']
  # 4. Construir Imagem Docker Corporativa e Registrar no GCR
  - name: 'gcr.io/cloud-builders/docker'
    args: ['build', '-t', 'gcr.io/exed-s4-portal/app:latest', '.']
  # 5. Publicar serviço estável no Cloud Run
  - name: 'gcr.io/google.com/cloudsdktool/cloud-sdk'
    entrypoint: 'gcloud'
    args: ['run', 'deploy', 'exed-s4-portal', '--image', 'gcr.io/exed-s4-portal/app:latest', '--platform', 'managed', '--port', '3000']</pre>
        <p>Esta especificação garante o funcionamento perfeito e serve como guia de engenharia definitivo para o time técnico corporativo codificar e publicar o Portal com sucesso.</p>
      </div>

    </body>
    </html>
  `;

  // Escrever o conteúdo para a janela de impressão
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Acionar a impressão automaticamente assim que carregar totalmente
  printWindow.onload = function() {
    printWindow.focus();
    // Um pequeno timeout garante a renderização completa das fontes e estilos antes de abrir a caixa de diálogo de PDF
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };
}
