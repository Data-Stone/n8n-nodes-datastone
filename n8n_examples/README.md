# Templates de Workflow - Data Stone para n8n

Workflows prontos para importar no n8n usando o nó comunitário [n8n-nodes-datastone](https://github.com/Data-Stone/n8n-nodes-datastone).

## Templates disponíveis

| # | Template | Descrição | Recurso |
|---|----------|-----------|---------|
| 01 | [Prospecção B2B - Pessoas](01_prospeccao_b2b_pessoas.json) | Prospecta contatos B2B por cargo/departamento com enriquecimento assíncrono | B2B Pessoa |
| 02 | [Prospecção B2B - Empresas](02_prospeccao_b2b_empresas.json) | Prospecta empresas B2B por setor/tamanho com enriquecimento assíncrono | B2B Empresa |
| 03 | [Consulta Pessoa por CPF](03_consulta_pessoa_cpf.json) | Consulta dados completos de uma pessoa pelo CPF | Pessoa |
| 04 | [Busca de Pessoa](04_busca_pessoa.json) | Busca pessoas por nome, email, telefone, UF | Pessoa |
| 05 | [Consulta Empresa por CNPJ](05_consulta_empresa_cnpj.json) | Consulta dados completos de uma empresa pelo CNPJ | Empresa |
| 06 | [Busca de Empresa](06_busca_empresa.json) | Busca empresas por razão social, email, domínio, UF | Empresa |

---

## Como importar no n8n

### Importar por URL (mais fácil)

Você pode importar qualquer template direto no n8n usando a URL do GitHub. Siga estes passos:

**Passo 1.** Abra o n8n no navegador e crie um novo workflow (ou abra um existente)

**Passo 2.** No canto superior direito, clique no botão **"..."** (três pontinhos)

**Passo 3.** No menu que abrir, clique em **"Import from URL..."**

**Passo 4.** Cole a URL do template que deseja importar e clique em **"Import"**

Copie a URL do template desejado abaixo:

- **Prospecção B2B - Pessoas:**
  ```
  https://raw.githubusercontent.com/Data-Stone/n8n-nodes-datastone/main/n8n_examples/01_prospeccao_b2b_pessoas.json
  ```

- **Prospecção B2B - Empresas:**
  ```
  https://raw.githubusercontent.com/Data-Stone/n8n-nodes-datastone/main/n8n_examples/02_prospeccao_b2b_empresas.json
  ```

- **Consulta Pessoa por CPF:**
  ```
  https://raw.githubusercontent.com/Data-Stone/n8n-nodes-datastone/main/n8n_examples/03_consulta_pessoa_cpf.json
  ```

- **Busca de Pessoa:**
  ```
  https://raw.githubusercontent.com/Data-Stone/n8n-nodes-datastone/main/n8n_examples/04_busca_pessoa.json
  ```

- **Consulta Empresa por CNPJ:**
  ```
  https://raw.githubusercontent.com/Data-Stone/n8n-nodes-datastone/main/n8n_examples/05_consulta_empresa_cnpj.json
  ```

- **Busca de Empresa:**
  ```
  https://raw.githubusercontent.com/Data-Stone/n8n-nodes-datastone/main/n8n_examples/06_busca_empresa.json
  ```

### Importar por arquivo

**Passo 1.** Clique no link do template acima para abrir o arquivo `.json` no GitHub

**Passo 2.** Clique no botão **"Download raw file"** (ícone de download) para baixar o arquivo

**Passo 3.** No n8n, clique em **"..."** (três pontinhos) no canto superior direito

**Passo 4.** Clique em **"Import from File..."**

**Passo 5.** Selecione o arquivo `.json` que você baixou

---

## Depois de importar

Após importar o template, você precisa configurar algumas coisas:

### 1. Configurar a credencial Data Stone API

- Clique em qualquer nó roxo (Data Stone) no workflow
- Na seção **"Credential to connect with"**, clique para criar uma nova credencial
- Cole sua **API Key** da Data Stone
- Salve a credencial

### 2. Ajustar parâmetros

- Edite os filtros de busca/prospecção conforme sua necessidade
- Nos templates 03 e 05, substitua o CPF/CNPJ de exemplo pelo real

### 3. Para templates com webhook (01 e 02)

Os templates de prospecção B2B usam enriquecimento assíncrono. Isso significa que a Data Stone processa os dados e envia o resultado de volta para o seu n8n via webhook. Para funcionar:

- No nó **"Enriquecer Contato"** (ou "Enriquecer Empresa"), substitua a URL do webhook pela URL real do seu n8n:
  ```
  https://SEU-DOMINIO.com/webhook/datastone-enrich-resultado
  ```
- **Ative o workflow** (toggle no canto superior direito) para que o webhook comece a escutar
- Só depois execute o fluxo

---

## Pré-requisitos

- [n8n](https://n8n.io/) instalado e rodando
- Nó comunitário `n8n-nodes-datastone` [instalado](https://github.com/Data-Stone/n8n-nodes-datastone#instalação)
- API key da [Data Stone](https://www.datastone.com.br/)
