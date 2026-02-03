# n8n-nodes-datastone

![Data Stone](https://img.shields.io/badge/Data%20Stone-API-1a73e8)
![n8n](https://img.shields.io/badge/n8n-community--node-ff6d5a)
![License](https://img.shields.io/badge/license-MIT-green)

Nó comunitário do n8n para a API da [Data Stone](https://www.datastone.com.br/) — plataforma líder em inteligência de dados B2B no Brasil para prospecção, enriquecimento e geração de leads.

[n8n](https://n8n.io/) é uma plataforma de automação de workflows com [licença fair-code](https://docs.n8n.io/reference/license/).

[Instalação](#instalação) |
[Credenciais](#credenciais) |
[Operações](#operações) |
[Templates](#templates-de-workflow) |
[Referência da API](#referência-da-api)

## Instalação

Siga o [guia de instalação](https://docs.n8n.io/integrations/community-nodes/installation/) da documentação de nós comunitários do n8n.

1. Acesse **Settings > Community Nodes**
2. Clique em **Install a community node**
3. Digite `n8n-nodes-datastone`
4. Clique em **Install**

## Credenciais

Você precisa de uma API key da Data Stone para usar este nó.

1. Crie uma conta em [datastone.com.br](https://www.datastone.com.br/)
2. Acesse seu perfil no painel
3. Gere uma nova API key

No n8n, crie uma nova credencial **Data Stone API** e cole sua API key.

## Operações

### Pessoa

| Operação | Descrição |
|---|---|
| **Consultar por CPF** | Consulta dados de uma pessoa pelo CPF |
| **Buscar** | Busca por nome, email, telefone, endereço, CEP ou UF |
| **Busca Avançada** | Busca por nome com wildcard (*) e filtros de estado/cidade |

**Campos disponíveis:** `name`, `birthday`, `age`, `gender`, `emails`, `addresses`, `mother_name`, `cbo_code`, `cbo_description`, `family_persons`, `related_companies`, `employer`

### Empresa

| Operação | Descrição |
|---|---|
| **Consultar por CNPJ** | Consulta dados de uma empresa pelo CNPJ |
| **Buscar** | Busca por razão social, email, domínio, CEP, telefone ou UF |
| **Buscar Filiais** | Encontra filiais a partir do CNPJ da matriz |

**Campos disponíveis:** `company_name`, `trading_name`, `cnpj`, `emails`, `partners`, `creation_date`, `business_size`, `cnae_code`, `cnae_description`, `addresses`, `branch_offices`, `land_lines`, `mobile_phones`

### B2B Pessoa

| Operação | Descrição |
|---|---|
| **Prospectar** | Prospecta contatos por cargo, departamento, senioridade e filtros de empresa |
| **Enriquecer** | Enriquece um contato (por URL do LinkedIn, email ou ID) |
| **Enriquecer em Lote** | Enriquece múltiplos contatos de uma vez |

**Filtros de pessoa (`filtros_pessoa`):** `departamentos`, `niveis_senioridade`, `cargos`, `habilidades`, `localizacoes`, `estados`, `has_email`, `has_phone`, `has_cnpj`, `has_linkedin`

**Filtros de empresa (`filtros_empresa`):** `nome_empresa`, `localizacoes`, `estados`, `setores`, `atividades_cnae`, `especialidades`, `tamanhos_empresa`, `naturezas_juridicas`, `data_fundacao`, `faixa_receita`, `incluir_mei`, `tem_cnpj`, `tem_email`, `tem_telefone`, `tem_linkedin`

### B2B Empresa

| Operação | Descrição |
|---|---|
| **Prospectar** | Prospecta empresas com filtros avançados |
| **Enriquecer** | Enriquece dados de uma empresa |
| **Enriquecer em Lote** | Enriquece múltiplas empresas de uma vez |

### Enriquecimento

| Operação | Descrição |
|---|---|
| **Listar Layouts** | Lista os layouts de enriquecimento disponíveis |
| **Criar Enriquecimento** | Cria um job de enriquecimento com arquivo (base64) |
| **Consultar Status** | Consulta o status/resultado de um job de enriquecimento |

### Conta

| Operação | Descrição |
|---|---|
| **Consultar Saldo** | Consulta o saldo da sua conta |

## Templates de Workflow

Temos 6 workflows prontos para importar direto no n8n. Para importar:

1. No n8n, clique em **"..."** (três pontinhos) no canto superior direito
2. Clique em **"Import from URL..."**
3. Cole a URL do template desejado e clique em **"Import"**

| Template | URL para importar |
|----------|-------------------|
| Prospecção B2B - Pessoas | `https://raw.githubusercontent.com/Data-Stone/n8n-nodes-datastone/main/n8n_examples/01_prospeccao_b2b_pessoas.json` |
| Prospecção B2B - Empresas | `https://raw.githubusercontent.com/Data-Stone/n8n-nodes-datastone/main/n8n_examples/02_prospeccao_b2b_empresas.json` |
| Consulta Pessoa por CPF | `https://raw.githubusercontent.com/Data-Stone/n8n-nodes-datastone/main/n8n_examples/03_consulta_pessoa_cpf.json` |
| Busca de Pessoa | `https://raw.githubusercontent.com/Data-Stone/n8n-nodes-datastone/main/n8n_examples/04_busca_pessoa.json` |
| Consulta Empresa por CNPJ | `https://raw.githubusercontent.com/Data-Stone/n8n-nodes-datastone/main/n8n_examples/05_consulta_empresa_cnpj.json` |
| Busca de Empresa | `https://raw.githubusercontent.com/Data-Stone/n8n-nodes-datastone/main/n8n_examples/06_busca_empresa.json` |

Após importar, configure a credencial Data Stone API com sua API key em qualquer nó Data Stone do workflow.

Para instruções detalhadas, veja [n8n_examples/README.md](n8n_examples/README.md).

## Exemplo: Prospectando contatos B2B por cargo

Use **B2B Pessoa > Prospectar** com os filtros abaixo para encontrar gerentes de qualidade em São Paulo:

**Filtros Pessoa (JSON):**
```json
{
  "cargos": ["Gerente de Qualidade", "Coordenador de Qualidade"],
  "departamentos": ["Qualidade"]
}
```

**Filtros Empresa (JSON):**
```json
{
  "estados": ["SP"],
  "setores": ["Indústria"]
}
```

## Referência da API

Este nó cobre 16 endpoints da [API Data Stone v1](https://docs.datastone.com.br/api):

| Método | Endpoint | Operação no nó |
|---|---|---|
| GET | `/persons` | Pessoa > Consultar por CPF |
| GET | `/persons/search` | Pessoa > Buscar |
| GET | `/persons/advanced-search` | Pessoa > Busca Avançada |
| GET | `/companies` | Empresa > Consultar por CNPJ |
| GET | `/company/list` | Empresa > Buscar |
| GET | `/company/search/filial` | Empresa > Buscar Filiais |
| POST | `/b2b/persons` | B2B Pessoa > Prospectar |
| POST | `/b2b/persons/enrich` | B2B Pessoa > Enriquecer |
| POST | `/b2b/persons/enrich/bulk` | B2B Pessoa > Enriquecer em Lote |
| POST | `/b2b/companies` | B2B Empresa > Prospectar |
| POST | `/b2b/companies/enrich` | B2B Empresa > Enriquecer |
| POST | `/b2b/companies/enrich/bulk` | B2B Empresa > Enriquecer em Lote |
| GET | `/enrichment/layouts` | Enriquecimento > Listar Layouts |
| POST | `/enrichment` | Enriquecimento > Criar Enriquecimento |
| GET | `/enrichment/{id}/result` | Enriquecimento > Consultar Status |
| GET | `/balance` | Conta > Consultar Saldo |

## Links úteis

- [Site da Data Stone](https://www.datastone.com.br/)
- [Documentação da API](https://docs.datastone.com.br/api)
- [Suporte Data Stone](https://suporte.datastone.com.br/)
- [Documentação de nós comunitários do n8n](https://docs.n8n.io/integrations/community-nodes/)

## Licença

[MIT](LICENSE.md)
