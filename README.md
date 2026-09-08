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
[Referência da API](#referência-da-api) |
[Onde o crédito é gasto](#onde-o-crédito-é-gasto)

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
| **Data Intel** | Contexto de negócio da empresa, lido do site institucional dela |

> **Data Intel** devolve ramo, produtos, público-alvo, diferenciais e ICP presumido — serve para qualificar e escrever a abordagem. Cobrança: **0 créditos** se o CNPJ já foi consultado pela conta nas últimas 24h, 1 crédito caso contrário (e aí a consulta cadastral do mesmo CNPJ nas 24h seguintes sai de graça). `status` diferente de `ready` nunca cobra. A **primeira** consulta de um site novo devolve `processing`: a análise entra na fila e fica pronta em poucos minutos; repetir a chamada é gratuito.

**Campos disponíveis:** `company_name`, `trading_name`, `cnpj`, `emails`, `partners`, `creation_date`, `business_size`, `cnae_code`, `cnae_description`, `addresses`, `branch_offices`, `land_lines`, `mobile_phones`

### B2B Pessoa

| Operação | Descrição |
|---|---|
| **Prospectar** | Prospecta contatos por cargo, departamento, senioridade e filtros de empresa |
| **Enriquecer** | Enriquece um contato; o resultado chega por webhook |
| **Enriquecer (Síncrono)** | Enriquece um contato e devolve o resultado na própria resposta |
| **Enriquecer em Lote** | Enriquece múltiplos contatos de uma vez |

**Filtros de pessoa (`filtros_pessoa`):** `departamentos`, `niveis_senioridade`, `cargos`, `habilidades`, `localizacoes`, `estados`, `has_email`, `has_phone`, `has_linkedin`

**Filtros de empresa (`filtros_empresa`):** `nome_empresa`, `localizacoes`, `estados`, `setores`, `atividades_cnae`, `tamanhos_empresa`, `tipos_trabalho`, `naturezas_juridicas`, `data_fundacao`, `incluir_mei`, `tem_email`, `tem_telefone`, `tem_linkedin`

> **Ano de fundação.** O filtro é por **ano**, não por data: a base B2B guarda só o ano de fundação. Os campos são "Ano de Fundação (Mínimo)" e "(Máximo)" — informar só um deles vale como "a partir de" / "até". Empresas cujo ano de fundação é desconhecido ficam de fora sempre que o filtro é usado.

> A API aceita mais filtros de empresa do que o node expõe hoje (`especialidades`, `setores_cnae`, `faixa_receita`, `tem_cnpj`) e `has_cnpj` em filtros de pessoa. Para usá-los, chame a API direto por um nó HTTP Request.

### B2B Empresa

| Operação | Descrição |
|---|---|
| **Prospectar** | Prospecta empresas com filtros avançados |
| **Enriquecer** | Enriquece uma empresa; o resultado chega por webhook |
| **Enriquecer (Síncrono)** | Enriquece uma empresa e devolve o resultado na própria resposta |
| **Enriquecer em Lote** | Enriquece múltiplas empresas de uma vez |

### Enriquecimento síncrono: quando o webhook deixa de ser necessário

Para **um** registro, a operação **Enriquecer (Síncrono)** dispensa o webhook: mesma base, mesma cascata de fornecedores, mesmo custo e mesmo formato de retorno — a diferença é que o resultado vem no corpo da resposta, e não depois. É o caminho recomendado num fluxo n8n, onde o próximo nó já pode consumir o dado.

O webhook **continua necessário** em dois casos:

- **Enriquecer em Lote** é assíncrono por desenho. Para volume, é ele que você quer — o síncrono aceita exatamente um registro por chamada.
- **Prospectar**, quando a busca cai no caminho de captura via LinkedIn, também responde depois.

Três desfechos possíveis no síncrono, e o nó trata os três:

| Resposta | O que significa | O que o nó faz |
|---|---|---|
| **200** | Concluído | Devolve o registro enriquecido |
| **202** | Não terminou a tempo e segue processando | Devolve o corpo com `_sync_status: "processing"` e `_status_path`, o caminho para consultar depois |
| **429** | Sem vaga para execução síncrona agora. **Nenhum crédito é debitado** | Falha com mensagem explicando; ative **Retry On Fail** no nó, ou use a operação assíncrona |

O `429` é controle de carga, não limite de plano: a execução síncrona mantém a conexão aberta enquanto consulta os fornecedores, então existe um teto de chamadas simultâneas.

### B2B Filtros e Autocomplete

Tudo aqui é **gratuito** — use antes de gastar crédito numa busca.

| Operação | Descrição |
|---|---|
| **Estrutura de Filtros** | Lista os filtros aceitos, com tipo e descrição |
| **Opções de Filtros** | Valores válidos dos filtros de vocabulário fechado (portes, departamentos, senioridades…) |
| **Autocomplete** | Busca valores válidos de um filtro: nome de empresa, cidade, setor, cargo, atividade CNAE, natureza jurídica, especialidade, setor CNAE, habilidade |

> **Atividades CNAE precisam do rótulo completo.** A busca B2B casa `"{código} - {descrição}"`; o código solto não casa com nada **e a busca é cobrada mesmo voltando vazia**. Pegue o valor pronto no Autocomplete (campo Atividade CNAE) — o nó recusa o formato errado antes de gastar crédito.

### Prospecção B2C (base da Receita)

Base da Receita Federal: CNAE, porte, natureza jurídica, sócios, renda e idade. É outra base, com outros nomes de campo, e serve para volume — decisor de PME é o **sócio**, que já vem no zip de empresas.

| Operação | Descrição |
|---|---|
| **Contar Pessoas** / **Contar Empresas** | Contagem, **gratuita**. Rode sempre antes de exportar |
| **Exportar Pessoas** / **Exportar Empresas** | Inicia a exportação; **cobra por registro exportado** |
| **Obter Resultado** | Busca o resultado de uma exportação pelo ID do job |
| **Listar Perfis** | Lista os perfis de prospecção da conta |
| **Salvar Filtro** / **Listar Filtros Salvos** | Guarda e lista filtros de prospecção |

Três formatos que a API exige e que **erram em silêncio** se vierem diferentes:

- **cidade** é `"Cidade - UF"`, com **hífen** — diferente do B2B, que usa vírgula (`"Cidade, UF"`);
- **bairro** é `"BAIRRO - CIDADE - UF"`, três partes;
- na exportação, o filtro **Nome** é obrigatório: a API o usa como nome do job. O nó recusa antes de chamar a API.

Use **Auxiliares** para descobrir cidades, bairros, CNAEs, setores CNAE e códigos CBO válidos. O campo **Filtros Extra (JSON)** é a saída para o que o nó ainda não expõe — mas atenção: `geo_points` satisfaz a exigência de filtro de localização e **não** recorta o resultado, então nunca use só ele.

### Auxiliares (Cidades, CNAE, CBO)

Vocabulário para montar filtro válido. Gratuito.

| Operação | Descrição |
|---|---|
| **Cidades** | Cidades, filtrando por nome e UF |
| **Bairros** | Bairros, filtrando por nome, cidade e UF |
| **CNAEs** | CNAEs, por código ou descrição |
| **Setores CNAE** | Setores CNAE, por código ou descrição |
| **Profissões (CBO)** | Códigos CBO, por código ou descrição |

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

Temos 8 workflows prontos para importar direto no n8n. Para importar:

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
| B2B sem webhook (síncrono) | `https://raw.githubusercontent.com/Data-Stone/n8n-nodes-datastone/main/n8n_examples/07_b2b_sem_webhook_sincrono.json` |
| Prospecção B2C: contar antes de exportar | `https://raw.githubusercontent.com/Data-Stone/n8n-nodes-datastone/main/n8n_examples/08_prospeccao_b2c_contar_antes.json` |

Após importar, configure a credencial Data Stone API com sua API key em qualquer nó Data Stone do workflow.

Para instruções detalhadas, veja [n8n_examples/README.md](n8n_examples/README.md).

## Exemplo: contato B2B pronto para abordagem, sem webhook

O fluxo que a maioria dos casos quer, todo dentro do n8n:

1. **B2B Filtros e Autocomplete > Opções de Filtros** — gratuito, confirma os valores de departamento e senioridade que a API aceita.
2. **B2B Pessoa > Prospectar** — 1 crédito pela busca; devolve os contatos e a chave de cache (paginar com ela é grátis).
3. **B2B Pessoa > Enriquecer (Síncrono)** — 1 crédito por contato, e é aqui que saem e-mail e telefone. O resultado vem na resposta, então o nó seguinte já consome o dado.
4. **WhatsApp > Validar Número** — confirma se o telefone tem WhatsApp antes de disparar.

Nenhum webhook envolvido. Para volume, troque o passo 3 por **Enriquecer em Lote** e receba por webhook.

## Exemplo: contando antes de gastar (B2C)

1. **Auxiliares > CNAEs** — acha o código da atividade.
2. **Prospecção B2C > Contar Empresas** — **gratuito**. Se o total não fizer sentido, ajuste o filtro aqui, não depois.
3. **Prospecção B2C > Exportar Empresas** — cobra por registro. Informe o filtro **Nome**, que a API usa como nome do job.
4. **Prospecção B2C > Obter Resultado** — com o ID do job devolvido acima.

O zip de empresas já traz os sócios: não exporte pessoas para obter sócio.

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

Este nó cobre 36 endpoints da [API Data Stone v1](https://docs.datastone.com.br/api).

| Método | Endpoint | Operação no nó |
|---|---|---|
| GET | `/persons/` | Pessoa > Consultar por CPF |
| GET | `/persons/search/` | Pessoa > Buscar |
| GET | `/persons/advanced-search/` | Pessoa > Busca Avançada |
| GET | `/companies/` | Empresa > Consultar por CNPJ |
| GET | `/company/list/` | Empresa > Buscar |
| GET | `/company/search/filial/` | Empresa > Buscar Filiais |
| GET | `/company/intel/` | Empresa > Data Intel |
| GET | `/whatsapp/search/` | WhatsApp > Validar Número |
| POST | `/whatsapp/batch/` | WhatsApp > Validação em Lote |
| POST | `/b2b/persons/` | B2B Pessoa > Prospectar |
| POST | `/b2b/persons/enrich` | B2B Pessoa > Enriquecer |
| POST | `/b2b/persons/enrich/sync` | B2B Pessoa > Enriquecer (Síncrono) |
| POST | `/b2b/persons/enrich/bulk` | B2B Pessoa > Enriquecer em Lote |
| POST | `/b2b/companies/` | B2B Empresa > Prospectar |
| POST | `/b2b/companies/enrich` | B2B Empresa > Enriquecer |
| POST | `/b2b/companies/enrich/sync` | B2B Empresa > Enriquecer (Síncrono) |
| POST | `/b2b/companies/enrich/bulk` | B2B Empresa > Enriquecer em Lote |
| GET | `/b2b/filter-structure/` | B2B Filtros e Autocomplete > Estrutura de Filtros |
| GET | `/b2b/filter-options/` | B2B Filtros e Autocomplete > Opções de Filtros |
| GET | `/b2b/search/` | B2B Filtros e Autocomplete > Autocomplete |
| POST | `/persons/prospect/` | Prospecção B2C > Contar / Exportar Pessoas |
| POST | `/company/prospect/` | Prospecção B2C > Contar / Exportar Empresas |
| GET | `/prospection/{job_id}/result/` | Prospecção B2C > Obter Resultado |
| GET | `/persons/prospect/profile/` | Prospecção B2C > Listar Perfis |
| POST | `/prospection/filters/` | Prospecção B2C > Salvar Filtro |
| GET | `/prospection/filters/list_person/` | Prospecção B2C > Listar Filtros Salvos (pessoas) |
| GET | `/prospection/filters/list_company/` | Prospecção B2C > Listar Filtros Salvos (empresas) |
| GET | `/geo/city/` | Auxiliares > Cidades |
| GET | `/geo/neighborhood/` | Auxiliares > Bairros |
| GET | `/cnae/` | Auxiliares > CNAEs |
| GET | `/sector/cnae/` | Auxiliares > Setores CNAE |
| GET | `/cbo/` | Auxiliares > Profissões (CBO) |
| GET | `/enrichment/layouts/` | Enriquecimento > Listar Layouts |
| POST | `/enrichment/` | Enriquecimento > Criar Enriquecimento |
| GET | `/enrichment/{id}/result/` | Enriquecimento > Consultar Status |
| GET | `/balance` | Conta > Consultar Saldo |

**Ainda fora do nó:** os 7 endpoints do **Data Reveal** (quem visita o site do cliente). Para usá-los, chame a API por um nó HTTP Request.

### Onde o crédito é gasto

| Gratuito | Cobra crédito |
|---|---|
| B2B Filtros e Autocomplete (todas) | Consultar por CPF / CNPJ |
| Auxiliares (todas) | Data Intel (1 crédito, ou 0 na carência de 24h) |
| Prospecção B2C > **Contar** | B2B > Prospectar (1 por busca; páginas seguintes pela chave de cache são grátis) |
| Prospecção B2C > Listar Perfis / Filtros Salvos | B2B > Enriquecer (1 por registro, estornado quando não vem dado) |
| Conta > Consultar Saldo | Prospecção B2C > **Exportar** (por registro exportado) |

Uma busca B2B repetida com os mesmos filtros não cobra de novo dentro de 7 dias.

## Links úteis

- [Site da Data Stone](https://www.datastone.com.br/)
- [Documentação da API](https://docs.datastone.com.br/api)
- [Suporte Data Stone](https://suporte.datastone.com.br/)
- [Documentação de nós comunitários do n8n](https://docs.n8n.io/integrations/community-nodes/)

## Licença

[MIT](LICENSE.md)
