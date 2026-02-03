# Prospecção de Contatos B2B no n8n — Guia Prático

## O que usar

Para encontrar contatos corporativos (áreas de Qualidade, Perdas, Prevenção), use o nó **Data Stone** com:

- **Resource:** `B2B Pessoa`
- **Operation:** `Prospectar`

Esse recurso permite filtrar profissionais por departamento, cargo, senioridade, localização e características da empresa — tudo direto no n8n, sem precisar montar requisições HTTP manualmente.

---

## Passo a passo

### 1. Configurar credencial

1. No n8n, vá em **Credentials** > **Add Credential**
2. Busque por **Data Stone API**
3. Cole sua **API Key** (obtida no painel da Data Stone)
4. Salve — o n8n testa a conexão automaticamente

### 2. Adicionar o nó Data Stone

1. No seu workflow, adicione o nó **Data Stone**
2. Selecione a credencial criada
3. Configure:
   - **Resource:** `B2B Pessoa`
   - **Operation:** `Prospectar`

### 3. Configurar Filtros Pessoa

Em **Filtros Pessoa**, clique em "Adicionar Filtro" e configure:

| Filtro | Valor sugerido | Observação |
|---|---|---|
| **Departamentos** | `Qualidade` | Dropdown multi-seleção. Outras opções úteis: `Operacoes/Producao`, `Seguranca, Saude e Meio Ambiente` |
| **Cargos** | `Gerente de Qualidade, Coordenador de Perdas, Analista de Prevenção` | Campo livre, separe por vírgula |
| **Niveis de Sênioridade** | `Pleno`, `Sênior`, `Decisores` | Dropdown multi-seleção |
| **Tem E-mail** | `true` | Garante que o contato possui email |
| **Tem Telefone** | `true` | Opcional, filtra contatos com telefone |
| **Estados (UF)** | Selecione os estados desejados (ex: `SP`, `RJ`, `MG`) | Dropdown multi-seleção com todos os 27 estados |

### 4. Configurar Filtros Empresa

Em **Filtros Empresa**, clique em "Adicionar Filtro":

| Filtro | Valor sugerido | Observação |
|---|---|---|
| **Setores** | `Industria, Varejo` | Campo livre, separe por vírgula |
| **Estados (UF)** | Mesmos estados dos filtros pessoa | Dropdown multi-seleção |
| **Tamanho da Empresa** | `51-200`, `201-500`, `501-1000` | Dropdown multi-seleção. Opções: `0-1`, `2-10`, `11-50`, `51-200`, `201-500`, `501-1000`, `1001-5000`, `5001-10000`, `10001+` |
| **Tipo de Trabalho** | `Empresa Privada` | Dropdown multi-seleção |

### 5. Paginação

| Campo | Descrição |
|---|---|
| **Pagina** | Número da página (padrão: 1) |
| **Por Pagina** | Quantidade de resultados por página (padrão: 10) |
| **Chave Cache** | Retornada na primeira consulta; use nas páginas seguintes para manter o mesmo resultado |

### 6. Enriquecer contatos encontrados

Após a prospecção, adicione um segundo nó **Data Stone** para obter dados completos:

- **Resource:** `B2B Pessoa`
- **Operation:** `Enriquecer`
- Preencha **um** dos campos:
  - **ID do Contato** — campo `id_pessoa` retornado pela prospecção (mais confiável)
  - **URL LinkedIn** — ex: `https://linkedin.com/in/nome-do-contato`
  - **Email** — ex: `contato@empresa.com.br`
- **Importante:** A prospecção retorna apenas `id_pessoa`, `nome`, `cargo` e `empresa`. Use o `id_pessoa` no campo "ID do Contato" para enriquecer e obter email, telefone, LinkedIn e demais dados.
- **URL Webhook** (obrigatório) — URL onde a Data Stone enviará o resultado do enriquecimento. Use um nó **Webhook** no n8n com o método configurado para aceitar **HEAD e POST** (a Data Stone valida a URL com HEAD antes de enviar os dados via POST).

Para enriquecer vários contatos de uma vez, use a operação **Enriquecer em Lote** passando um array JSON.

---

## Fluxo completo sugerido

```
[Trigger/Manual] → [Data Stone: B2B Pessoa > Prospectar] → [Data Stone: B2B Pessoa > Enriquecer] → [Google Sheets / CRM]
```

**Detalhamento:**

1. **Trigger** — Manual ou agendado (ex: rodar semanalmente)
2. **Data Stone: Prospectar** — Filtros pessoa com departamentos `Qualidade` + cargos relevantes + `has_email = true`. Filtros empresa com setores `Industria, Varejo` e tamanhos desejados
3. **Data Stone: Enriquecer** — Para cada contato retornado, enriquecer via LinkedIn ou email para obter dados completos
4. **Destino** — Salvar em planilha, CRM ou enviar por email

Se precisar prospectar empresas primeiro e depois buscar contatos dentro delas, use dois blocos:

```
[Data Stone: B2B Empresa > Prospectar] → [Data Stone: B2B Pessoa > Prospectar (com nome da empresa)]
```

---

## Dados retornados

A prospecção e o enriquecimento retornam campos como:

- Nome completo
- Cargo
- Departamento
- Email
- Telefone
- URL do LinkedIn
- Dados da empresa (nome, setor, tamanho, localização)

Os campos exatos dependem da disponibilidade na base da Data Stone para cada contato.

---

## Dicas

- Use **Tem E-mail = true** para garantir contatos acionáveis
- O campo **Cargos** é texto livre — experimente variações como "Gerente de Qualidade", "Supervisor de Perdas", "Coordenador de Prevenção"
- **Departamentos** disponíveis no dropdown: Administrativo, Agronegocios, Atendimento/Suporte ao Cliente, Comercial/Vendas, Consultoria, Educacao, Engenharia, Financeiro/Contabil, Imobiliario, Logistica/Suprimentos, Manutencao, Marketing/Comunicacao, Operacoes/Producao, Pesquisa & Desenvolvimento (P&D), Planejamento, Projetos, Qualidade, Recursos Humanos, Saude, Seguranca Saude e Meio Ambiente, TI (Tecnologia da Informacao), Varejo, Nao classificavel
- **Niveis de Sênioridade** disponíveis: Estagiário/Trainee, Iniciante, Junior, Pleno, Sênior, Decisores
- Para consultar seu saldo de créditos, use Resource `Conta` > Operation `Consultar Saldo`
