# Exed Quality Gates & Playbook Portal

Portal de Governança, Auditoria Metodológica e Gestão de Qualidade da **Exed Consulting**.

## Executar localmente

**Pré-requisitos:** Node.js 18+

1. Instalar dependências:
   ```
   npm install
   ```
2. Copie `.env.example` para `.env.local` e preencha o que for usar (Gemini/Firebase são opcionais — sem eles o app roda 100% funcional em modo local).
3. Rodar em modo desenvolvimento:
   ```
   npm run dev
   ```
4. Build de produção:
   ```
   npm run build
   npm run start
   ```

## Banco de dados (Firebase Firestore)

O app funciona em dois modos, de forma automática:

- **Sem configuração** (padrão): usa um arquivo JSON local como banco. Ótimo para testar, mas no Vercel os dados **não persistem** entre execuções (ambiente serverless sem disco permanente).
- **Com Firebase configurado**: usa o Firestore como banco real e persistente, através do Firebase Admin SDK (autenticação de servidor via Service Account — não expõe nenhuma credencial ao navegador).

### Como configurar o Firestore

1. Crie um projeto em https://console.firebase.google.com (gratuito no plano Spark para uso de piloto).
2. Ative o **Firestore Database** (modo produção).
3. Em **Configurações do projeto → Contas de serviço**, clique em **Gerar nova chave privada** — isso baixa um JSON com `project_id`, `client_email` e `private_key`.
4. Configure as variáveis de ambiente (no Vercel: *Project Settings → Environment Variables*; localmente: `.env.local`):
   ```
   FIREBASE_PROJECT_ID=seu-project-id
   FIREBASE_CLIENT_EMAIL=xxx@seu-project-id.iam.gserviceaccount.com
   FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
   ```
5. Faça o deploy de `firestore.rules` (via Firebase CLI: `firebase deploy --only firestore:rules`, ou colando o conteúdo direto no console do Firestore). As regras já vêm travadas (`allow read, write: if false`) porque só o backend, autenticado via Service Account, deve acessar os dados — o navegador nunca fala com o Firestore diretamente.
6. Redeploy o projeto no Vercel para que as novas variáveis entrem em vigor.

Ao subir com essas variáveis configuradas, o log do servidor mostra `Firebase Admin initialized successfully for Firestore backend.` confirmando que o banco real está ativo.

## Acesso

Usuário padrão: `pmo_adm@exedconsulting.com` / senha `PMO2026` (perfil PMO ADM), ou clique em **"Entrar sem Senha"** na tela de login.
