import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
	JsonObject,
	NodeApiError,
	NodeConnectionTypes,
} from 'n8n-workflow';

export class DataStone implements INodeType {
	description: INodeTypeDescription = {
		displayName: 'Data Stone',
		name: 'dataStone',
		icon: 'file:datastone.svg',
		group: ['transform'],
		version: 1,
		subtitle: '={{$parameter["resource"] + ": " + $parameter["operation"]}}',
		description: 'Consume Data Stone API for Brazilian data enrichment and prospecting',
		defaults: {
			name: 'Data Stone',
		},
		inputs: [NodeConnectionTypes.Main],
		outputs: [NodeConnectionTypes.Main],
		credentials: [
			{
				name: 'dataStoneApi',
				required: true,
			},
		],
		properties: [
			// ── Resource ──
			{
				displayName: 'Resource',
				name: 'resource',
				type: 'options',
				noDataExpression: true,
				options: [
					{ name: 'Pessoa (Person)', value: 'person' },
					{ name: 'Empresa (Company)', value: 'company' },
					{ name: 'WhatsApp', value: 'whatsapp' },
					{ name: 'B2B Pessoa', value: 'b2bPerson' },
					{ name: 'B2B Empresa', value: 'b2bCompany' },
					{ name: 'B2B Filtros E Autocomplete', value: 'b2bMeta' },
					{ name: 'Prospecção B2C (Receita)', value: 'prospection' },
					{ name: 'Enriquecimento (Enrichment)', value: 'enrichment' },
					{ name: 'Auxiliares (Cidades, CNAE, CBO)', value: 'auxiliary' },
					{ name: 'Conta (Account)', value: 'account' },
				],
				default: 'person',
			},

			// ── Operations ──

			// Person operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['person'] } },
				options: [
					{ name: 'Consultar por CPF', value: 'getByCpf', action: 'Consultar pessoa por CPF' },
					{ name: 'Buscar', value: 'search', action: 'Buscar pessoa' },
					{ name: 'Busca Avançada', value: 'advancedSearch', action: 'Busca avançada de pessoa' },
				],
				default: 'getByCpf',
			},

			// Company operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['company'] } },
				options: [
					{
						name: 'Consultar por CNPJ',
						value: 'getByCnpj',
						action: 'Consultar empresa por CNPJ',
					},
					{ name: 'Buscar', value: 'search', action: 'Buscar empresa' },
					{ name: 'Buscar Filiais', value: 'searchBranches', action: 'Buscar filiais' },
					{
						name: 'Data Intel (Contexto De Negócio)',
						value: 'getIntel',
						action: 'Obter data intel da empresa',
					},
				],
				default: 'getByCnpj',
			},

			// WhatsApp operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['whatsapp'] } },
				options: [
					{ name: 'Validar Número', value: 'validate', action: 'Validar número WhatsApp' },
					{
						name: 'Validação em Lote',
						value: 'batchValidate',
						action: 'Validação em lote WhatsApp',
					},
				],
				default: 'validate',
			},

			// B2B Person operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['b2bPerson'] } },
				options: [
					{ name: 'Prospectar', value: 'prospect', action: 'Prospectar pessoa B2B' },
					{ name: 'Enriquecer', value: 'enrich', action: 'Enriquecer pessoa B2B' },
					{
						name: 'Enriquecer (Síncrono)',
						value: 'enrichSync',
						action: 'Enriquecer pessoa B2B de forma síncrona',
					},
					{
						name: 'Enriquecer em Lote',
						value: 'enrichBulk',
						action: 'Enriquecer pessoas B2B em lote',
					},
				],
				default: 'prospect',
			},

			// B2B Company operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['b2bCompany'] } },
				options: [
					{ name: 'Prospectar', value: 'prospect', action: 'Prospectar empresa B2B' },
					{ name: 'Enriquecer', value: 'enrich', action: 'Enriquecer empresa B2B' },
					{
						name: 'Enriquecer (Síncrono)',
						value: 'enrichSync',
						action: 'Enriquecer empresa B2B de forma síncrona',
					},
					{
						name: 'Enriquecer em Lote',
						value: 'enrichBulk',
						action: 'Enriquecer empresas B2B em lote',
					},
				],
				default: 'prospect',
			},

			// Enrichment operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['enrichment'] } },
				options: [
					{ name: 'Listar Layouts', value: 'listLayouts', action: 'Listar layouts' },
					{
						name: 'Criar Enriquecimento',
						value: 'create',
						action: 'Criar enriquecimento',
					},
					{
						name: 'Consultar Status',
						value: 'getStatus',
						action: 'Consultar status do enriquecimento',
					},
				],
				default: 'listLayouts',
			},

			// Account operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['account'] } },
				options: [
					{ name: 'Consultar Saldo', value: 'getBalance', action: 'Consultar saldo' },
				],
				default: 'getBalance',
			},

			// ── Parameters ──

			// Person - getByCpf
			{
				displayName: 'CPF',
				name: 'cpf',
				type: 'string',
				required: true,
				default: '',
				placeholder: '000.000.000-00',
				description: 'CPF da pessoa a ser consultada',
				displayOptions: { show: { resource: ['person'], operation: ['getByCpf'] } },
			},
			{
				displayName: 'Campos',
				name: 'fields',
				type: 'string',
				default: '',
				placeholder: 'name,birthday,gender',
				description: 'Campos específicos a retornar (separados por vírgula). Ex: name, birthday, age, gender, emails, addresses, mother_name, cbo_code, cbo_description, family_persons, related_companies, employer',
				displayOptions: { show: { resource: ['person'], operation: ['getByCpf'] } },
			},

			// Person - search
			{
				displayName: 'Filtros de Busca',
				name: 'personSearchFilters',
				type: 'collection',
				placeholder: 'Adicionar Filtro',
				default: {},
				displayOptions: { show: { resource: ['person'], operation: ['search'] } },
				options: [
					{
						displayName: 'Nome',
						name: 'name',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Telefone',
						name: 'phone',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Nome da Mãe',
						name: 'mother',
						type: 'string',
						default: '',
					},
					{
						displayName: 'CEP',
						name: 'zip_code',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Endereço',
						name: 'address',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Número',
						name: 'address_number',
						type: 'string',
						default: '',
					},
					{
						displayName: 'UF',
						name: 'uf',
						type: 'string',
						default: '',
						placeholder: 'SP',
					},
				],
			},

			// Person - advancedSearch
			{
				displayName: 'Nome (com wildcard *)',
				name: 'advSearchName',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'João*Silva',
				description: 'Nome com suporte a wildcard (*)',
				displayOptions: { show: { resource: ['person'], operation: ['advancedSearch'] } },
			},
			{
				displayName: 'Estado',
				name: 'advSearchState',
				type: 'string',
				default: '',
				placeholder: 'SP',
				displayOptions: { show: { resource: ['person'], operation: ['advancedSearch'] } },
			},
			{
				displayName: 'Cidade',
				name: 'advSearchCity',
				type: 'string',
				default: '',
				placeholder: 'São Paulo',
				displayOptions: { show: { resource: ['person'], operation: ['advancedSearch'] } },
			},

			// Company - getByCnpj
			{
				displayName: 'CNPJ',
				name: 'cnpj',
				type: 'string',
				required: true,
				default: '',
				placeholder: '00.000.000/0000-00',
				description: 'CNPJ da empresa a ser consultada',
				displayOptions: { show: { resource: ['company'], operation: ['getByCnpj'] } },
			},
			{
				displayName: 'Campos',
				name: 'fields',
				type: 'string',
				default: '',
				placeholder: 'company_name,cnae_code',
				description: 'Campos específicos a retornar (separados por vírgula). Ex: company_name, trading_name, cnpj, emails, partners, creation_date, business_size, cnae_code, cnae_description, addresses, branch_offices, land_lines, mobile_phones',
				displayOptions: { show: { resource: ['company'], operation: ['getByCnpj'] } },
			},

			// Company - search
			{
				displayName: 'Filtros de Busca',
				name: 'companySearchFilters',
				type: 'collection',
				placeholder: 'Adicionar Filtro',
				default: {},
				displayOptions: { show: { resource: ['company'], operation: ['search'] } },
				options: [
					{
						displayName: 'Razão Social',
						name: 'razao_social',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Email',
						name: 'email',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Domínio',
						name: 'domain',
						type: 'string',
						default: '',
					},
					{
						displayName: 'CEP',
						name: 'cep',
						type: 'string',
						default: '',
					},
					{
						displayName: 'Telefone',
						name: 'phone',
						type: 'string',
						default: '',
					},
					{
						displayName: 'UF',
						name: 'uf',
						type: 'string',
						default: '',
						placeholder: 'SP',
					},
				],
			},

			// Company - searchBranches
			{
				displayName: 'CNPJ',
				name: 'cnpj',
				type: 'string',
				required: true,
				default: '',
				placeholder: '00.000.000/0000-00',
				description: 'CNPJ da matriz para buscar filiais',
				displayOptions: { show: { resource: ['company'], operation: ['searchBranches'] } },
			},

			// WhatsApp - validate
			{
				displayName: 'DDD',
				name: 'ddd',
				type: 'string',
				required: true,
				default: '',
				placeholder: '11',
				displayOptions: { show: { resource: ['whatsapp'], operation: ['validate'] } },
			},
			{
				displayName: 'Telefone',
				name: 'phone',
				type: 'string',
				required: true,
				default: '',
				placeholder: '999999999',
				displayOptions: { show: { resource: ['whatsapp'], operation: ['validate'] } },
			},

			// WhatsApp - batchValidate
			{
				displayName: 'Telefones (JSON Array)',
				name: 'phones',
				type: 'json',
				required: true,
				default: '[]',
				placeholder: '[{"ddd":"11","phone":"999999999"}]',
				description: 'Array de telefones para validação (máx. 1000)',
				displayOptions: { show: { resource: ['whatsapp'], operation: ['batchValidate'] } },
			},
			{
				displayName: 'Callback URL',
				name: 'callbackUrl',
				type: 'string',
				default: '',
				description: 'URL para receber o resultado via webhook',
				displayOptions: { show: { resource: ['whatsapp'], operation: ['batchValidate'] } },
			},

			// B2B Person - prospect
			{
				displayName: 'Página',
				name: 'pagina',
				type: 'number',
				default: 1,
				displayOptions: {
					show: { resource: ['b2bPerson'], operation: ['prospect'] },
				},
			},
			{
				displayName: 'Por Página',
				name: 'porPagina',
				type: 'number',
				default: 10,
				displayOptions: {
					show: { resource: ['b2bPerson'], operation: ['prospect'] },
				},
			},
			{
				displayName: 'Chave Cache',
				name: 'chaveCache',
				type: 'string',
				default: '',
				description: 'Chave de cache para paginação',
				displayOptions: {
					show: { resource: ['b2bPerson'], operation: ['prospect'] },
				},
			},
			{
				displayName: 'Filtros Pessoa',
				name: 'filtrosPessoa',
				type: 'collection',
				placeholder: 'Adicionar Filtro',
				default: {},
				displayOptions: {
					show: { resource: ['b2bPerson'], operation: ['prospect'] },
				},
				options: [
					{
						displayName: 'Cargos',
						name: 'cargos',
						type: 'string',
						default: '',
						placeholder: 'Gerente de Qualidade, Coordenador de TI',
						description: 'Cargos separados por vírgula (campo livre)',
					},
					{
						displayName: 'Departamentos',
						name: 'departamentos',
						type: 'multiOptions',
						default: [],
						options: [
							{ name: 'Administrativo', value: 'Administrativo' },
							{ name: 'Agronegócios', value: 'Agronegócios' },
							{ name: 'Atendimento/Suporte ao Cliente', value: 'Atendimento/Suporte ao Cliente' },
							{ name: 'Comercial/Vendas', value: 'Comercial/Vendas' },
							{ name: 'Consultoria', value: 'Consultoria' },
							{ name: 'Educação', value: 'Educação' },
							{ name: 'Engenharia', value: 'Engenharia' },
							{ name: 'Financeiro/Contábil', value: 'Financeiro/Contábil' },
							{ name: 'Imobiliário', value: 'Imobiliário' },
							{ name: 'Logística/Suprimentos', value: 'Logística/Suprimentos' },
							{ name: 'Manutenção', value: 'Manutenção' },
							{ name: 'Marketing/Comunicação', value: 'Marketing/Comunicação' },
							{ name: 'Operações/Produção', value: 'Operações/Produção' },
							{ name: 'Pesquisa & Desenvolvimento (P&D)', value: 'Pesquisa & Desenvolvimento (P&D)' },
							{ name: 'Planejamento', value: 'Planejamento' },
							{ name: 'Projetos', value: 'Projetos' },
							{ name: 'Qualidade', value: 'Qualidade' },
							{ name: 'Recursos Humanos', value: 'Recursos Humanos' },
							{ name: 'Saúde', value: 'Saúde' },
							{ name: 'Segurança, Saúde e Meio Ambiente', value: 'Segurança, Saúde e Meio Ambiente' },
							{ name: 'TI (Tecnologia da Informação)', value: 'TI (Tecnologia da Informação)' },
							{ name: 'Varejo', value: 'Varejo' },
							{ name: 'Não classificável', value: 'Não classificável' },
						],
						description: 'Selecione um ou mais departamentos',
					},
					{
						displayName: 'Níveis de Senioridade',
						name: 'niveis_senioridade',
						type: 'multiOptions',
						default: [],
						options: [
							{ name: 'Estagiário/Trainee', value: 'Estagiário/Trainee' },
							{ name: 'Iniciante', value: 'Iniciante' },
							{ name: 'Junior', value: 'Junior' },
							{ name: 'Pleno', value: 'Pleno' },
							{ name: 'Sênior', value: 'Sênior' },
							{ name: 'Decisores', value: 'Decisores' },
						],
						description: 'Selecione um ou mais níveis de senioridade',
					},
					{
						displayName: 'Habilidades',
						name: 'habilidades',
						type: 'string',
						default: '',
						placeholder: 'Python, JavaScript, Gestão',
						description: 'Habilidades separadas por vírgula (campo livre)',
					},
					{
						displayName: 'Estados (UF)',
						name: 'estados',
						type: 'multiOptions',
						default: [],
						options: [
							{ name: 'Acre (AC)', value: 'AC' },
							{ name: 'Alagoas (AL)', value: 'AL' },
							{ name: 'Amapá (AP)', value: 'AP' },
							{ name: 'Amazonas (AM)', value: 'AM' },
							{ name: 'Bahia (BA)', value: 'BA' },
							{ name: 'Ceará (CE)', value: 'CE' },
							{ name: 'Distrito Federal (DF)', value: 'DF' },
							{ name: 'Espírito Santo (ES)', value: 'ES' },
							{ name: 'Goiás (GO)', value: 'GO' },
							{ name: 'Maranhão (MA)', value: 'MA' },
							{ name: 'Mato Grosso (MT)', value: 'MT' },
							{ name: 'Mato Grosso do Sul (MS)', value: 'MS' },
							{ name: 'Minas Gerais (MG)', value: 'MG' },
							{ name: 'Pará (PA)', value: 'PA' },
							{ name: 'Paraíba (PB)', value: 'PB' },
							{ name: 'Paraná (PR)', value: 'PR' },
							{ name: 'Pernambuco (PE)', value: 'PE' },
							{ name: 'Piauí (PI)', value: 'PI' },
							{ name: 'Rio de Janeiro (RJ)', value: 'RJ' },
							{ name: 'Rio Grande do Norte (RN)', value: 'RN' },
							{ name: 'Rio Grande do Sul (RS)', value: 'RS' },
							{ name: 'Rondônia (RO)', value: 'RO' },
							{ name: 'Roraima (RR)', value: 'RR' },
							{ name: 'Santa Catarina (SC)', value: 'SC' },
							{ name: 'São Paulo (SP)', value: 'SP' },
							{ name: 'Sergipe (SE)', value: 'SE' },
							{ name: 'Tocantins (TO)', value: 'TO' },
						],
						description: 'Selecione um ou mais estados',
					},
					{
						displayName: 'Localizações',
						name: 'localizacoes',
						type: 'string',
						default: '',
						placeholder: 'São Paulo, SP; Rio de Janeiro, RJ',
						description: 'Localizações no formato "Cidade, UF" separadas por ponto e vírgula',
					},
					{
						displayName: 'Tem E-mail',
						name: 'has_email',
						type: 'boolean',
						default: false,
						description: 'Whether to filter only contacts that have an email address',
					},
					{
						displayName: 'Tem Telefone',
						name: 'has_phone',
						type: 'boolean',
						default: false,
						description: 'Whether to filter only contacts that have a phone number',
					},
					{
						displayName: 'Tem LinkedIn',
						name: 'has_linkedin',
						type: 'boolean',
						default: false,
						description: 'Whether to filter only contacts that have a LinkedIn profile',
					},
					{
						displayName: 'Tem CNPJ',
						name: 'has_cnpj',
						type: 'boolean',
						default: false,
						description: 'Whether to filter only contacts whose company has a CNPJ',
					},
				],
			},
			{
				displayName: 'Filtros Empresa',
				name: 'filtrosEmpresa',
				type: 'collection',
				placeholder: 'Adicionar Filtro',
				default: {},
				displayOptions: {
					show: { resource: ['b2bPerson'], operation: ['prospect'] },
				},
				options: [
					{
						displayName: 'Nome da Empresa',
						name: 'nome_empresa',
						type: 'string',
						default: '',
						placeholder: 'Google, Microsoft',
						description: 'Nomes de empresas separados por vírgula',
					},
					{
						displayName: 'Estados (UF)',
						name: 'estados',
						type: 'multiOptions',
						default: [],
						options: [
							{ name: 'Acre (AC)', value: 'AC' },
							{ name: 'Alagoas (AL)', value: 'AL' },
							{ name: 'Amapá (AP)', value: 'AP' },
							{ name: 'Amazonas (AM)', value: 'AM' },
							{ name: 'Bahia (BA)', value: 'BA' },
							{ name: 'Ceará (CE)', value: 'CE' },
							{ name: 'Distrito Federal (DF)', value: 'DF' },
							{ name: 'Espírito Santo (ES)', value: 'ES' },
							{ name: 'Goiás (GO)', value: 'GO' },
							{ name: 'Maranhão (MA)', value: 'MA' },
							{ name: 'Mato Grosso (MT)', value: 'MT' },
							{ name: 'Mato Grosso do Sul (MS)', value: 'MS' },
							{ name: 'Minas Gerais (MG)', value: 'MG' },
							{ name: 'Pará (PA)', value: 'PA' },
							{ name: 'Paraíba (PB)', value: 'PB' },
							{ name: 'Paraná (PR)', value: 'PR' },
							{ name: 'Pernambuco (PE)', value: 'PE' },
							{ name: 'Piauí (PI)', value: 'PI' },
							{ name: 'Rio de Janeiro (RJ)', value: 'RJ' },
							{ name: 'Rio Grande do Norte (RN)', value: 'RN' },
							{ name: 'Rio Grande do Sul (RS)', value: 'RS' },
							{ name: 'Rondônia (RO)', value: 'RO' },
							{ name: 'Roraima (RR)', value: 'RR' },
							{ name: 'Santa Catarina (SC)', value: 'SC' },
							{ name: 'São Paulo (SP)', value: 'SP' },
							{ name: 'Sergipe (SE)', value: 'SE' },
							{ name: 'Tocantins (TO)', value: 'TO' },
						],
						description: 'Selecione um ou mais estados',
					},
					{
						displayName: 'Localizações',
						name: 'localizacoes',
						type: 'string',
						default: '',
						placeholder: 'São Paulo, SP; Rio de Janeiro, RJ',
						description: 'Localizações no formato "Cidade, UF" separadas por ponto e vírgula',
					},
					{
						displayName: 'Setores',
						name: 'setores',
						type: 'string',
						default: '',
						placeholder: 'Tecnologia, Indústria, Varejo',
						description: 'Setores separados por vírgula (campo livre)',
					},
					{
						displayName: 'Atividades CNAE',
						name: 'atividades_cnae',
						type: 'string',
						default: '',
						placeholder: '6201500 - Desenvolvimento de programas de computador, sob encomenda',
						description: 'Rótulo COMPLETO da atividade ("{código} - {descrição}"), separando vários por ponto e vírgula. O código solto não casa com nada e a busca é cobrada igual — pegue o valor pronto em B2B Filtros E Autocomplete > Autocomplete, campo Atividade CNAE.',
					},
					{
						displayName: 'Tamanho da Empresa',
						name: 'tamanhos_empresa',
						type: 'multiOptions',
						default: [],
						options: [
							{ name: '0-1', value: '0-1' },
							{ name: '2-10', value: '2-10' },
							{ name: '11-50', value: '11-50' },
							{ name: '51-200', value: '51-200' },
							{ name: '201-500', value: '201-500' },
							{ name: '501-1000', value: '501-1000' },
							{ name: '1001-5000', value: '1001-5000' },
							{ name: '5001-10000', value: '5001-10000' },
							{ name: '10001+', value: '10001+' },
						],
						description: 'Selecione uma ou mais faixas de funcionários',
					},
					{
						displayName: 'Tipo de Trabalho',
						name: 'tipos_trabalho',
						type: 'multiOptions',
						default: [],
						options: [
							{ name: 'Empresa Privada', value: 'Empresa Privada' },
							{ name: 'Empresa Pública', value: 'Empresa Pública' },
							{ name: 'Agência do Governo', value: 'Agência do Governo' },
							{ name: 'Instituição Educacional', value: 'Instituição Educacional' },
							{ name: 'Sem Fins Lucrativos', value: 'Sem Fins Lucrativos' },
							{ name: 'Parceria', value: 'Parceria' },
							{ name: 'Propriedade Individual', value: 'Propriedade Individual' },
							{ name: 'Trabalhadores Por Conta Própria', value: 'Trabalhadores Por Conta Própria' },
						],
						description: 'Selecione um ou mais tipos',
					},
					{
						displayName: 'Natureza Jurídica',
						name: 'naturezas_juridicas',
						type: 'multiOptions',
						default: [],
						options: [
							{ name: 'Administração Pública', value: 1 },
							{ name: 'Entidades Empresariais', value: 2 },
							{ name: 'Entidades sem Fins Lucrativos', value: 3 },
							{ name: 'Pessoas Físicas', value: 4 },
							{ name: 'Organizações Internacionais', value: 5 },
						],
						description: 'Selecione uma ou mais naturezas jurídicas',
					},
					{
						displayName: 'Incluir MEI',
						name: 'incluir_mei',
						type: 'boolean',
						default: false,
						description: 'Whether to include MEI companies in results',
					},
					{
						displayName: 'Tem E-mail',
						name: 'tem_email',
						type: 'boolean',
						default: false,
						description: 'Whether to filter only companies that have an email',
					},
					{
						displayName: 'Tem Telefone',
						name: 'tem_telefone',
						type: 'boolean',
						default: false,
						description: 'Whether to filter only companies that have a phone',
					},
					{
						displayName: 'Tem LinkedIn',
						name: 'tem_linkedin',
						type: 'boolean',
						default: false,
						description: 'Whether to filter only companies that have a LinkedIn page',
					},
					{
						displayName: 'Especialidades',
						name: 'especialidades',
						type: 'string',
						default: '',
						placeholder: 'Software; Cloud Computing',
						description: 'Especialidades separadas por ponto e vírgula. Use B2B Filtros E Autocomplete > Autocomplete com campo Especialidade para os valores válidos.',
					},
					{
						displayName: 'Setores CNAE',
						name: 'setores_cnae',
						type: 'string',
						default: '',
						placeholder: 'Indústria',
						description: 'Setores CNAE separados por ponto e vírgula. Só vale na prospecção de EMPRESAS: na de pessoas a API recusa com 400 nomeando o filtro.',
					},
					{
						displayName: 'Tem CNPJ',
						name: 'tem_cnpj',
						type: 'boolean',
						default: false,
						description: 'Whether to filter only companies that have a CNPJ',
					},
					{
						displayName: 'Faturamento Mínimo',
						name: 'receita_minima',
						type: 'number',
						default: 0,
						description: 'Piso do faturamento estimado, em reais. Zero significa sem piso; mínimo e máximo são independentes.',
					},
					{
						displayName: 'Faturamento Máximo',
						name: 'receita_maxima',
						type: 'number',
						default: 0,
						description: 'Teto do faturamento estimado, em reais. Zero significa sem teto.',
					},
					{
						displayName: 'Ano De Fundação (Mínimo)',
						name: 'ano_fundacao_min',
						type: 'number',
						default: 0,
						placeholder: '2015',
						description: 'Ano de fundação mínimo. A base B2B guarda apenas o ANO, não a data. Informar só este campo vale como "fundadas a partir de".',
					},
					{
						displayName: 'Ano De Fundação (Máximo)',
						name: 'ano_fundacao_max',
						type: 'number',
						default: 0,
						placeholder: '2024',
						description: 'Ano de fundação máximo. Informar só este campo vale como "fundadas até". Atenção: empresas com ano de fundação desconhecido ficam de fora sempre que este filtro é usado.',
					},
				],
			},
			{
				displayName: 'URL Webhook',
				name: 'urlWebhook',
				type: 'string',
				default: '',
				displayOptions: {
					show: { resource: ['b2bPerson'], operation: ['prospect'] },
				},
			},

			// B2B Person - enrich
			{
				displayName: 'URL LinkedIn',
				name: 'contatoLinkedin',
				type: 'string',
				default: '',
				placeholder: 'https://linkedin.com/in/nome-do-contato',
				description: 'URL do perfil LinkedIn do contato',
				displayOptions: {
					show: { resource: ['b2bPerson'], operation: ['enrich'] },
				},
			},
			{
				displayName: 'Email',
				name: 'contatoEmail',
				type: 'string',
				default: '',
				placeholder: 'contato@empresa.com.br',
				description: 'Email do contato (alternativa ao LinkedIn)',
				displayOptions: {
					show: { resource: ['b2bPerson'], operation: ['enrich'] },
				},
			},
			{
				displayName: 'ID do Contato',
				name: 'contatoId',
				type: 'string',
				default: '',
				description: 'ID interno do contato na Data Stone (alternativa ao LinkedIn/email)',
				displayOptions: {
					show: { resource: ['b2bPerson'], operation: ['enrich'] },
				},
			},
			{
				displayName: 'URL Webhook',
				name: 'urlWebhook',
				type: 'string',
				required: true,
				default: '',
				description: 'URL para receber o resultado do enriquecimento (obrigatório — a API processa de forma assíncrona)',
				placeholder: 'https://seusite.com/webhook',
				displayOptions: {
					show: { resource: ['b2bPerson'], operation: ['enrich'] },
				},
			},

			// B2B Person - enrichBulk
			{
				displayName: 'Contatos (JSON Array)',
				name: 'contatos',
				type: 'json',
				required: true,
				default: '[]',
				placeholder: '[{"url_linkedin":"..."}]',
				description: 'Array de contatos para enriquecimento em lote',
				displayOptions: {
					show: { resource: ['b2bPerson'], operation: ['enrichBulk'] },
				},
			},
			{
				displayName: 'URL Webhook',
				name: 'urlWebhook',
				type: 'string',
				required: true,
				default: '',
				description: 'URL para receber o resultado do enriquecimento (obrigatório)',
				placeholder: 'https://seusite.com/webhook',
				displayOptions: {
					show: { resource: ['b2bPerson'], operation: ['enrichBulk'] },
				},
			},

			// B2B Company - prospect
			{
				displayName: 'Página',
				name: 'pagina',
				type: 'number',
				default: 1,
				displayOptions: {
					show: { resource: ['b2bCompany'], operation: ['prospect'] },
				},
			},
			{
				displayName: 'Por Página',
				name: 'porPagina',
				type: 'number',
				default: 10,
				displayOptions: {
					show: { resource: ['b2bCompany'], operation: ['prospect'] },
				},
			},
			{
				displayName: 'Chave Cache',
				name: 'chaveCache',
				type: 'string',
				default: '',
				description: 'Chave de cache para paginação',
				displayOptions: {
					show: { resource: ['b2bCompany'], operation: ['prospect'] },
				},
			},
			{
				displayName: 'Filtros Empresa',
				name: 'filtrosEmpresa',
				type: 'collection',
				placeholder: 'Adicionar Filtro',
				default: {},
				displayOptions: {
					show: { resource: ['b2bCompany'], operation: ['prospect'] },
				},
				options: [
					{
						displayName: 'Nome da Empresa',
						name: 'nome_empresa',
						type: 'string',
						default: '',
						placeholder: 'Google, Microsoft',
						description: 'Nomes de empresas separados por vírgula',
					},
					{
						displayName: 'Estados (UF)',
						name: 'estados',
						type: 'multiOptions',
						default: [],
						options: [
							{ name: 'Acre (AC)', value: 'AC' },
							{ name: 'Alagoas (AL)', value: 'AL' },
							{ name: 'Amapá (AP)', value: 'AP' },
							{ name: 'Amazonas (AM)', value: 'AM' },
							{ name: 'Bahia (BA)', value: 'BA' },
							{ name: 'Ceará (CE)', value: 'CE' },
							{ name: 'Distrito Federal (DF)', value: 'DF' },
							{ name: 'Espírito Santo (ES)', value: 'ES' },
							{ name: 'Goiás (GO)', value: 'GO' },
							{ name: 'Maranhão (MA)', value: 'MA' },
							{ name: 'Mato Grosso (MT)', value: 'MT' },
							{ name: 'Mato Grosso do Sul (MS)', value: 'MS' },
							{ name: 'Minas Gerais (MG)', value: 'MG' },
							{ name: 'Pará (PA)', value: 'PA' },
							{ name: 'Paraíba (PB)', value: 'PB' },
							{ name: 'Paraná (PR)', value: 'PR' },
							{ name: 'Pernambuco (PE)', value: 'PE' },
							{ name: 'Piauí (PI)', value: 'PI' },
							{ name: 'Rio de Janeiro (RJ)', value: 'RJ' },
							{ name: 'Rio Grande do Norte (RN)', value: 'RN' },
							{ name: 'Rio Grande do Sul (RS)', value: 'RS' },
							{ name: 'Rondônia (RO)', value: 'RO' },
							{ name: 'Roraima (RR)', value: 'RR' },
							{ name: 'Santa Catarina (SC)', value: 'SC' },
							{ name: 'São Paulo (SP)', value: 'SP' },
							{ name: 'Sergipe (SE)', value: 'SE' },
							{ name: 'Tocantins (TO)', value: 'TO' },
						],
						description: 'Selecione um ou mais estados',
					},
					{
						displayName: 'Localizações',
						name: 'localizacoes',
						type: 'string',
						default: '',
						placeholder: 'São Paulo, SP; Rio de Janeiro, RJ',
						description: 'Localizações no formato "Cidade, UF" separadas por ponto e vírgula',
					},
					{
						displayName: 'Setores',
						name: 'setores',
						type: 'string',
						default: '',
						placeholder: 'Tecnologia, Indústria, Varejo',
						description: 'Setores separados por vírgula (campo livre)',
					},
					{
						displayName: 'Atividades CNAE',
						name: 'atividades_cnae',
						type: 'string',
						default: '',
						placeholder: '6201500 - Desenvolvimento de programas de computador, sob encomenda',
						description: 'Rótulo COMPLETO da atividade ("{código} - {descrição}"), separando vários por ponto e vírgula. O código solto não casa com nada e a busca é cobrada igual — pegue o valor pronto em B2B Filtros E Autocomplete > Autocomplete, campo Atividade CNAE.',
					},
					{
						displayName: 'Tamanho da Empresa',
						name: 'tamanhos_empresa',
						type: 'multiOptions',
						default: [],
						options: [
							{ name: '0-1', value: '0-1' },
							{ name: '2-10', value: '2-10' },
							{ name: '11-50', value: '11-50' },
							{ name: '51-200', value: '51-200' },
							{ name: '201-500', value: '201-500' },
							{ name: '501-1000', value: '501-1000' },
							{ name: '1001-5000', value: '1001-5000' },
							{ name: '5001-10000', value: '5001-10000' },
							{ name: '10001+', value: '10001+' },
						],
						description: 'Selecione uma ou mais faixas de funcionários',
					},
					{
						displayName: 'Tipo de Trabalho',
						name: 'tipos_trabalho',
						type: 'multiOptions',
						default: [],
						options: [
							{ name: 'Empresa Privada', value: 'Empresa Privada' },
							{ name: 'Empresa Pública', value: 'Empresa Pública' },
							{ name: 'Agência do Governo', value: 'Agência do Governo' },
							{ name: 'Instituição Educacional', value: 'Instituição Educacional' },
							{ name: 'Sem Fins Lucrativos', value: 'Sem Fins Lucrativos' },
							{ name: 'Parceria', value: 'Parceria' },
							{ name: 'Propriedade Individual', value: 'Propriedade Individual' },
							{ name: 'Trabalhadores Por Conta Própria', value: 'Trabalhadores Por Conta Própria' },
						],
						description: 'Selecione um ou mais tipos',
					},
					{
						displayName: 'Natureza Jurídica',
						name: 'naturezas_juridicas',
						type: 'multiOptions',
						default: [],
						options: [
							{ name: 'Administração Pública', value: 1 },
							{ name: 'Entidades Empresariais', value: 2 },
							{ name: 'Entidades sem Fins Lucrativos', value: 3 },
							{ name: 'Pessoas Físicas', value: 4 },
							{ name: 'Organizações Internacionais', value: 5 },
						],
						description: 'Selecione uma ou mais naturezas jurídicas',
					},
					{
						displayName: 'Incluir MEI',
						name: 'incluir_mei',
						type: 'boolean',
						default: false,
						description: 'Whether to include MEI companies in results',
					},
					{
						displayName: 'Tem E-mail',
						name: 'tem_email',
						type: 'boolean',
						default: false,
						description: 'Whether to filter only companies that have an email',
					},
					{
						displayName: 'Tem Telefone',
						name: 'tem_telefone',
						type: 'boolean',
						default: false,
						description: 'Whether to filter only companies that have a phone',
					},
					{
						displayName: 'Tem LinkedIn',
						name: 'tem_linkedin',
						type: 'boolean',
						default: false,
						description: 'Whether to filter only companies that have a LinkedIn page',
					},
					{
						displayName: 'Especialidades',
						name: 'especialidades',
						type: 'string',
						default: '',
						placeholder: 'Software; Cloud Computing',
						description: 'Especialidades separadas por ponto e vírgula. Use B2B Filtros E Autocomplete > Autocomplete com campo Especialidade para os valores válidos.',
					},
					{
						displayName: 'Setores CNAE',
						name: 'setores_cnae',
						type: 'string',
						default: '',
						placeholder: 'Indústria',
						description: 'Setores CNAE separados por ponto e vírgula. Só vale na prospecção de EMPRESAS: na de pessoas a API recusa com 400 nomeando o filtro.',
					},
					{
						displayName: 'Tem CNPJ',
						name: 'tem_cnpj',
						type: 'boolean',
						default: false,
						description: 'Whether to filter only companies that have a CNPJ',
					},
					{
						displayName: 'Faturamento Mínimo',
						name: 'receita_minima',
						type: 'number',
						default: 0,
						description: 'Piso do faturamento estimado, em reais. Zero significa sem piso; mínimo e máximo são independentes.',
					},
					{
						displayName: 'Faturamento Máximo',
						name: 'receita_maxima',
						type: 'number',
						default: 0,
						description: 'Teto do faturamento estimado, em reais. Zero significa sem teto.',
					},
					{
						displayName: 'Ano De Fundação (Mínimo)',
						name: 'ano_fundacao_min',
						type: 'number',
						default: 0,
						placeholder: '2015',
						description: 'Ano de fundação mínimo. A base B2B guarda apenas o ANO, não a data. Informar só este campo vale como "fundadas a partir de".',
					},
					{
						displayName: 'Ano De Fundação (Máximo)',
						name: 'ano_fundacao_max',
						type: 'number',
						default: 0,
						placeholder: '2024',
						description: 'Ano de fundação máximo. Informar só este campo vale como "fundadas até". Atenção: empresas com ano de fundação desconhecido ficam de fora sempre que este filtro é usado.',
					},
				],
			},

			// B2B Company - enrich
			{
				displayName: 'CNPJ',
				name: 'contatoCnpj',
				type: 'string',
				default: '',
				placeholder: '00000000000000',
				description: 'CNPJ da empresa para enriquecimento',
				displayOptions: {
					show: { resource: ['b2bCompany'], operation: ['enrich'] },
				},
			},
			{
				displayName: 'URL LinkedIn',
				name: 'contatoLinkedin',
				type: 'string',
				default: '',
				placeholder: 'https://linkedin.com/company/nome-empresa',
				description: 'URL do LinkedIn da empresa (alternativa ao CNPJ)',
				displayOptions: {
					show: { resource: ['b2bCompany'], operation: ['enrich'] },
				},
			},
			{
				displayName: 'URL Webhook',
				name: 'urlWebhook',
				type: 'string',
				required: true,
				default: '',
				description: 'URL para receber o resultado do enriquecimento (obrigatório)',
				placeholder: 'https://seusite.com/webhook',
				displayOptions: {
					show: { resource: ['b2bCompany'], operation: ['enrich'] },
				},
			},

			// B2B Company - enrichBulk
			{
				displayName: 'Contatos (JSON Array)',
				name: 'contatos',
				type: 'json',
				required: true,
				default: '[]',
				placeholder: '[{"cnpj":"..."}]',
				description: 'Array de empresas para enriquecimento em lote',
				displayOptions: {
					show: { resource: ['b2bCompany'], operation: ['enrichBulk'] },
				},
			},
			{
				displayName: 'URL Webhook',
				name: 'urlWebhook',
				type: 'string',
				required: true,
				default: '',
				description: 'URL para receber o resultado do enriquecimento (obrigatório)',
				placeholder: 'https://seusite.com/webhook',
				displayOptions: {
					show: { resource: ['b2bCompany'], operation: ['enrichBulk'] },
				},
			},

			// Enrichment - create
			{
				displayName: 'Nome',
				name: 'enrichmentName',
				type: 'string',
				required: true,
				default: '',
				description: 'Nome do enriquecimento',
				displayOptions: {
					show: { resource: ['enrichment'], operation: ['create'] },
				},
			},
			{
				displayName: 'Layout ID',
				name: 'layoutId',
				type: 'string',
				required: true,
				default: '',
				description: 'ID do layout de enriquecimento',
				displayOptions: {
					show: { resource: ['enrichment'], operation: ['create'] },
				},
			},
			{
				displayName: 'Parâmetros (JSON)',
				name: 'enrichmentParameters',
				type: 'json',
				default: '{}',
				description: 'Parâmetros adicionais do enriquecimento',
				displayOptions: {
					show: { resource: ['enrichment'], operation: ['create'] },
				},
			},
			{
				displayName: 'Arquivo (Base64)',
				name: 'fileBase64',
				type: 'string',
				default: '',
				description: 'Conteúdo do arquivo em Base64',
				displayOptions: {
					show: { resource: ['enrichment'], operation: ['create'] },
				},
			},
			{
				displayName: 'Email de Callback',
				name: 'callbackEmail',
				type: 'string',
				default: '',
				description: 'Email para notificação de conclusão',
				displayOptions: {
					show: { resource: ['enrichment'], operation: ['create'] },
				},
			},

			// ── Empresa - Data Intel ──
			{
				displayName: 'CNPJ',
				name: 'intelCnpj',
				type: 'string',
				required: true,
				default: '',
				placeholder: '12345678000199',
				description: 'CNPJ completo, com os zeros à esquerda. A primeira consulta de um site novo devolve status "processing": a análise entra na fila e fica pronta em poucos minutos; repetir a chamada é gratuito.',
				displayOptions: {
					show: { resource: ['company'], operation: ['getIntel'] },
				},
			},

			// ── B2B enriquecimento síncrono (pessoa) ──
			{
				displayName: 'URL LinkedIn',
				name: 'syncPessoaLinkedin',
				type: 'string',
				default: '',
				placeholder: 'https://linkedin.com/in/nome-do-contato',
				description: 'Identificador da pessoa. Informe ao menos um entre URL LinkedIn, email, CPF e ID.',
				displayOptions: {
					show: { resource: ['b2bPerson'], operation: ['enrichSync'] },
				},
			},
			{
				displayName: 'Email',
				name: 'syncPessoaEmail',
				type: 'string',
				default: '',
				placeholder: 'contato@empresa.com.br',
				description: 'Email da pessoa (alternativa ao LinkedIn)',
				displayOptions: {
					show: { resource: ['b2bPerson'], operation: ['enrichSync'] },
				},
			},
			{
				displayName: 'CPF',
				name: 'syncPessoaCpf',
				type: 'string',
				default: '',
				placeholder: '12345678901',
				description: 'CPF da pessoa (alternativa ao LinkedIn)',
				displayOptions: {
					show: { resource: ['b2bPerson'], operation: ['enrichSync'] },
				},
			},
			{
				displayName: 'ID Da Pessoa',
				name: 'syncPessoaId',
				type: 'string',
				default: '',
				description: 'ID interno da pessoa na Data Stone (alternativa ao LinkedIn)',
				displayOptions: {
					show: { resource: ['b2bPerson'], operation: ['enrichSync'] },
				},
			},

			// ── B2B enriquecimento síncrono (empresa) ──
			{
				displayName: 'CNPJ',
				name: 'syncEmpresaCnpj',
				type: 'string',
				default: '',
				placeholder: '12345678000199',
				description: 'Identificador da empresa. Informe ao menos um entre CNPJ e URL LinkedIn.',
				displayOptions: {
					show: { resource: ['b2bCompany'], operation: ['enrichSync'] },
				},
			},
			{
				displayName: 'URL LinkedIn',
				name: 'syncEmpresaLinkedin',
				type: 'string',
				default: '',
				placeholder: 'https://linkedin.com/company/nome-da-empresa',
				description: 'URL da página da empresa no LinkedIn (alternativa ao CNPJ)',
				displayOptions: {
					show: { resource: ['b2bCompany'], operation: ['enrichSync'] },
				},
			},

			// ── B2B autocomplete ──
			{
				displayName: 'Campo',
				name: 'autocompleteField',
				type: 'options',
				required: true,
				default: 'nome_empresa',
				description: 'Campo do filtro cujos valores válidos serão buscados',
				options: [
					{ name: 'Atividade CNAE', value: 'atividade_cnae' },
					{ name: 'Cargo', value: 'cargo' },
					{ name: 'Especialidade', value: 'especialidade' },
					{ name: 'Habilidade', value: 'habilidade' },
					{ name: 'Localização (Cidade)', value: 'localizacao' },
					{ name: 'Natureza Jurídica', value: 'natureza_juridica' },
					{ name: 'Nome Da Empresa', value: 'nome_empresa' },
					{ name: 'Setor', value: 'setor' },
					{ name: 'Setor CNAE', value: 'setor_cnae' },
				],
				displayOptions: {
					show: { resource: ['b2bMeta'], operation: ['autocomplete'] },
				},
			},
			{
				displayName: 'Termo',
				name: 'autocompleteTerm',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Google',
				description: 'Termo a buscar. Para atividades CNAE, use o rótulo COMPLETO devolvido aqui ("{código} - {descrição}") no filtro: o código solto é recusado.',
				displayOptions: {
					show: { resource: ['b2bMeta'], operation: ['autocomplete'] },
				},
			},

			// ── Auxiliares ──
			{
				displayName: 'Nome',
				name: 'auxName',
				type: 'string',
				default: '',
				description: 'Filtra por nome (busca parcial)',
				displayOptions: {
					show: { resource: ['auxiliary'], operation: ['cities', 'neighborhoods'] },
				},
			},
			{
				displayName: 'Estado (UF)',
				name: 'auxState',
				type: 'string',
				default: '',
				placeholder: 'SP',
				description: 'Sigla da UF',
				displayOptions: {
					show: { resource: ['auxiliary'], operation: ['cities', 'neighborhoods'] },
				},
			},
			{
				displayName: 'Cidade',
				name: 'auxCity',
				type: 'string',
				default: '',
				description: 'Nome da cidade do bairro',
				displayOptions: {
					show: { resource: ['auxiliary'], operation: ['neighborhoods'] },
				},
			},
			{
				displayName: 'Código',
				name: 'auxCode',
				type: 'string',
				default: '',
				description: 'Filtra pelo código exato',
				displayOptions: {
					show: { resource: ['auxiliary'], operation: ['cnae', 'sectorCnae', 'cbo'] },
				},
			},
			{
				displayName: 'Descrição',
				name: 'auxDescription',
				type: 'string',
				default: '',
				description: 'Filtra pela descrição (busca parcial)',
				displayOptions: {
					show: { resource: ['auxiliary'], operation: ['cnae', 'sectorCnae', 'cbo'] },
				},
			},
			{
				displayName: 'Página',
				name: 'auxPage',
				type: 'number',
				default: 1,
				description: 'Página do resultado',
				displayOptions: {
					show: { resource: ['auxiliary'], operation: ['cnae', 'sectorCnae', 'cbo'] },
				},
			},
			{
				displayName: 'Itens Por Página',
				name: 'auxPageSize',
				type: 'number',
				default: 50,
				description: 'Quantos itens por página',
				displayOptions: {
					show: { resource: ['auxiliary'], operation: ['cnae', 'sectorCnae', 'cbo'] },
				},
			},

			// ── Prospecção B2C: filtros de PESSOAS ──
			// A base é a da Receita. Formatos que a API exige e que erram em silêncio
			// se vierem diferentes: cidade é "Cidade - UF" (hífen, diferente do B2B, que
			// usa vírgula) e bairro é "BAIRRO - CIDADE - UF".
			{
				displayName: 'Filtros De Pessoas',
				name: 'filtrosProspeccaoPessoas',
				type: 'collection',
				placeholder: 'Adicionar Filtro',
				default: {},
				displayOptions: {
					show: { resource: ['prospection'], operation: ['countPersons', 'exportPersons'] },
				},
				options: [
					{
						displayName: 'Nome',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Nome da pessoa (busca parcial). Obrigatório na exportação, pois nomeia o job.',
					},
					{
						displayName: 'Cidades',
						name: 'cities',
						type: 'string',
						default: '',
						placeholder: 'São Paulo - SP; Rio de Janeiro - RJ',
						description: 'Cidades no formato "Cidade - UF" (com hífen), separadas por ponto e vírgula. Atenção: o B2B usa vírgula, este endpoint usa hífen.',
					},
					{
						displayName: 'Estados (UF)',
						name: 'states',
						type: 'string',
						default: '',
						placeholder: 'SP; RJ',
						description: 'Siglas de UF separadas por ponto e vírgula',
					},
					{
						displayName: 'DDDs',
						name: 'ddds',
						type: 'string',
						default: '',
						placeholder: '11; 21',
						description: 'DDDs de 2 dígitos separados por ponto e vírgula',
					},
					{
						displayName: 'Bairros',
						name: 'neighborhoodies',
						type: 'string',
						default: '',
						placeholder: 'CENTRO - SÃO PAULO - SP',
						description: 'Bairros no formato "BAIRRO - CIDADE - UF" (três partes), separados por ponto e vírgula. Fora desse formato a API recusa.',
					},
					{
						displayName: 'Códigos CBO (Profissões)',
						name: 'cbo_codes',
						type: 'string',
						default: '',
						placeholder: '252105; 411005',
						description: 'Códigos CBO separados por ponto e vírgula. Use a operação Auxiliares > Profissões (CBO) para descobri-los.',
					},
					{
						displayName: 'Sexo',
						name: 'gender',
						type: 'options',
						default: '',
						options: [
							{ name: 'Qualquer', value: '' },
							{ name: 'Masculino', value: 'M' },
							{ name: 'Feminino', value: 'F' },
						],
						description: 'Sexo da pessoa',
					},
					{
						displayName: 'Idade Mínima',
						name: 'age_lower',
						type: 'number',
						default: 0,
						description: 'Idade mínima. Zero significa sem limite inferior.',
					},
					{
						displayName: 'Idade Máxima',
						name: 'age_upper',
						type: 'number',
						default: 0,
						description: 'Idade máxima. Zero significa sem limite superior.',
					},
					{
						displayName: 'Nascimento De',
						name: 'birthday_start',
						type: 'string',
						default: '',
						placeholder: '1980-01-01',
						description: 'Início do período de nascimento, no formato AAAA-MM-DD. Aqui a data é real, com dia e mês.',
					},
					{
						displayName: 'Nascimento Até',
						name: 'birthday_end',
						type: 'string',
						default: '',
						placeholder: '1990-12-31',
						description: 'Fim do período de nascimento, no formato AAAA-MM-DD',
					},
					{
						displayName: 'Renda Estimada Mínima',
						name: 'income_lower',
						type: 'number',
						default: 0,
						description: 'Piso da faixa de renda estimada, em reais. Zero significa sem piso.',
					},
					{
						displayName: 'Renda Estimada Máxima',
						name: 'income_upper',
						type: 'number',
						default: 0,
						description: 'Teto da faixa de renda estimada, em reais. Zero significa sem teto.',
					},
					{
						displayName: 'Canais De Contato',
						name: 'contact_channels',
						type: 'multiOptions',
						default: [],
						options: [
							{ name: 'Endereço', value: 'address' },
							{ name: 'Email', value: 'email' },
							{ name: 'SMS', value: 'sms' },
							{ name: 'Telefone', value: 'phone' },
							{ name: 'WhatsApp', value: 'whatsapp' },
						],
						description: 'Exige que a pessoa tenha os canais escolhidos',
					},
					{
						displayName: 'Perfis (Match Profile)',
						name: 'match_profile',
						type: 'string',
						default: '',
						placeholder: 'PF1',
						description: 'Códigos de perfil separados por ponto e vírgula. Use a operação Listar Perfis para descobri-los.',
					},
				],
			},

			// ── Prospecção B2C: filtros de EMPRESAS ──
			{
				displayName: 'Filtros De Empresas',
				name: 'filtrosProspeccaoEmpresas',
				type: 'collection',
				placeholder: 'Adicionar Filtro',
				default: {},
				displayOptions: {
					show: { resource: ['prospection'], operation: ['countCompanies', 'exportCompanies'] },
				},
				options: [
					{
						displayName: 'Nome',
						name: 'name',
						type: 'string',
						default: '',
						description: 'Razão social ou nome fantasia (busca parcial). Obrigatório na exportação, pois nomeia o job.',
					},
					{
						displayName: 'Cidades',
						name: 'cities',
						type: 'string',
						default: '',
						placeholder: 'São Paulo - SP; Rio de Janeiro - RJ',
						description: 'Cidades no formato "Cidade - UF" (com hífen), separadas por ponto e vírgula',
					},
					{
						displayName: 'Estados (UF)',
						name: 'states',
						type: 'string',
						default: '',
						placeholder: 'SP; RJ',
						description: 'Siglas de UF separadas por ponto e vírgula',
					},
					{
						displayName: 'DDDs',
						name: 'ddds',
						type: 'string',
						default: '',
						placeholder: '11; 21',
						description: 'DDDs de 2 dígitos separados por ponto e vírgula',
					},
					{
						displayName: 'Bairros',
						name: 'neighborhoodies',
						type: 'string',
						default: '',
						placeholder: 'CENTRO - SÃO PAULO - SP',
						description: 'Bairros no formato "BAIRRO - CIDADE - UF" (três partes), separados por ponto e vírgula',
					},
					{
						displayName: 'Códigos CNAE',
						name: 'cnae_codes',
						type: 'string',
						default: '',
						placeholder: '5231101; 6201501',
						description: 'Códigos CNAE separados por ponto e vírgula. Use Auxiliares > CNAEs para descobri-los. Aqui vale o código, diferente do B2B, que exige o rótulo completo.',
					},
					{
						displayName: 'Setores CNAE',
						name: 'sector_codes',
						type: 'string',
						default: '',
						placeholder: 'ATIVIDADE FINANCEIRA SEGUROS',
						description: 'Setores CNAE separados por ponto e vírgula. Use Auxiliares > Setores CNAE.',
					},
					{
						displayName: 'Matriz Ou Filial',
						name: 'headquarter_type',
						type: 'options',
						default: '',
						options: [
							{ name: 'Ambas', value: '' },
							{ name: 'Somente Matriz', value: 'H' },
							{ name: 'Somente Filial', value: 'B' },
						],
						description: 'Somente matriz evita repetir filiais do mesmo grupo no resultado',
					},
					{
						displayName: 'Porte',
						name: 'company_type',
						type: 'multiOptions',
						default: [],
						options: [
							{ name: 'ME (Microempresa)', value: 'ME' },
							{ name: 'EPP (Pequeno Porte)', value: 'EPP' },
							{ name: 'Demais', value: 'DEMAIS' },
						],
						description: 'Porte da empresa segundo a Receita',
					},
					{
						displayName: 'MEI',
						name: 'mei_type',
						type: 'options',
						default: '',
						options: [
							{ name: 'Indiferente', value: '' },
							{ name: 'Somente MEI', value: 'SIM' },
							{ name: 'Excluir MEI', value: 'NAO' },
						],
						description: 'Se restringe ou exclui microempreendedores individuais',
					},
					{
						displayName: 'Simples Nacional',
						name: 'simple_type',
						type: 'options',
						default: '',
						options: [
							{ name: 'Indiferente', value: '' },
							{ name: 'Somente Optantes', value: 'SIM' },
							{ name: 'Excluir Optantes', value: 'NAO' },
						],
						description: 'Se restringe ou exclui optantes do Simples Nacional',
					},
					{
						displayName: 'Comércio Exterior',
						name: 'import_export',
						type: 'options',
						default: '',
						options: [
							{ name: 'Indiferente', value: '' },
							{ name: 'Importa', value: 'IMPORTA' },
							{ name: 'Exporta', value: 'EXPORTA' },
						],
						description: 'Restringe a quem importa ou exporta',
					},
					{
						displayName: 'Naturezas Jurídicas',
						name: 'nature_codes',
						type: 'string',
						default: '',
						placeholder: '2062; 3999',
						description: 'Códigos de natureza jurídica separados por ponto e vírgula',
					},
					{
						displayName: 'Funcionários (Mínimo)',
						name: 'employees_lower',
						type: 'number',
						default: 0,
						description: 'Piso de funcionários estimados. Zero significa sem piso.',
					},
					{
						displayName: 'Funcionários (Máximo)',
						name: 'employees_upper',
						type: 'number',
						default: 0,
						description: 'Teto de funcionários estimados. Zero significa sem teto.',
					},
					{
						displayName: 'Abertura De',
						name: 'created_start',
						type: 'string',
						default: '',
						placeholder: '2020-01-01',
						description: 'Início do período de abertura na Receita, no formato AAAA-MM-DD. Aqui a data é real, com dia e mês — diferente do filtro de fundação do B2B, que é só o ano.',
					},
					{
						displayName: 'Abertura Até',
						name: 'created_end',
						type: 'string',
						default: '',
						placeholder: '2025-12-31',
						description: 'Fim do período de abertura na Receita, no formato AAAA-MM-DD',
					},
					{
						displayName: 'Faturamento Mínimo',
						name: 'revenue_lower',
						type: 'number',
						default: 0,
						description: 'Piso do faturamento estimado, em reais. Zero significa sem piso.',
					},
					{
						displayName: 'Faturamento Máximo',
						name: 'revenue_upper',
						type: 'number',
						default: 0,
						description: 'Teto do faturamento estimado, em reais. Zero significa sem teto.',
					},
					{
						displayName: 'Capital Social Mínimo',
						name: 'capital_lower',
						type: 'number',
						default: 0,
						description: 'Piso do capital social, em reais. Zero significa sem piso.',
					},
					{
						displayName: 'Capital Social Máximo',
						name: 'capital_upper',
						type: 'number',
						default: 0,
						description: 'Teto do capital social, em reais. Zero significa sem teto.',
					},
					{
						displayName: 'Veículos (Mínimo)',
						name: 'vehicles_lower',
						type: 'number',
						default: 0,
						description: 'Piso da frota. Zero significa sem piso.',
					},
					{
						displayName: 'Veículos (Máximo)',
						name: 'vehicles_upper',
						type: 'number',
						default: 0,
						description: 'Teto da frota. Zero significa sem teto.',
					},
				],
			},

			// ── Prospecção B2C: escape hatch e campos do export ──
			{
				displayName: 'Filtros Extra (JSON)',
				name: 'prospeccaoFiltrosExtra',
				type: 'json',
				default: '{}',
				description: 'Mesclado no corpo da requisição, para os filtros que este node ainda não expõe (por exemplo geo_points). Atenção: geo_points satisfaz a exigência de filtro de localização mas NÃO recorta o resultado — nunca use só ele.',
				displayOptions: {
					show: {
						resource: ['prospection'],
						operation: ['countPersons', 'exportPersons', 'countCompanies', 'exportCompanies'],
					},
				},
			},
			{
				displayName: 'Quantidade',
				name: 'prospeccaoQuantidade',
				type: 'number',
				required: true,
				default: 100,
				description: 'Quantos registros exportar. A API não ordena por relevância: exportar 100 de 20.000 devolve os 100 primeiros da fonte, então vale estreitar o filtro antes de aumentar a quantidade.',
				displayOptions: {
					show: { resource: ['prospection'], operation: ['exportPersons', 'exportCompanies'] },
				},
			},
			{
				displayName: 'Formato Do Arquivo',
				name: 'prospeccaoFormato',
				type: 'options',
				default: 'excel',
				options: [
					{ name: 'Excel', value: 'excel' },
					{ name: 'CSV', value: 'csv' },
				],
				description: 'Formato do arquivo gerado',
				displayOptions: {
					show: { resource: ['prospection'], operation: ['exportPersons', 'exportCompanies'] },
				},
			},
			{
				displayName: 'Email De Callback',
				name: 'prospeccaoCallbackEmail',
				type: 'string',
				default: '',
				placeholder: 'usuario@empresa.com',
				description: 'Email avisado quando a exportação terminar',
				displayOptions: {
					show: { resource: ['prospection'], operation: ['exportPersons', 'exportCompanies'] },
				},
			},

			// ── Prospecção B2C: resultado e filtros salvos ──
			{
				displayName: 'ID Do Job',
				name: 'prospeccaoJobId',
				type: 'string',
				required: true,
				default: '',
				description: 'ID do job devolvido pela exportação',
				displayOptions: {
					show: { resource: ['prospection'], operation: ['getResult'] },
				},
			},
			{
				displayName: 'Tipo',
				name: 'prospeccaoTipoFiltro',
				type: 'options',
				default: 'person',
				options: [
					{ name: 'Pessoas', value: 'person' },
					{ name: 'Empresas', value: 'company' },
				],
				description: 'Se o filtro é de pessoas ou de empresas',
				displayOptions: {
					show: {
						resource: ['prospection'],
						operation: ['saveFilter', 'listSavedFilters'],
					},
				},
			},
			{
				displayName: 'Nome Do Filtro',
				name: 'prospeccaoNomeFiltro',
				type: 'string',
				required: true,
				default: '',
				placeholder: 'Executivos SP',
				description: 'Nome com que o filtro será salvo',
				displayOptions: {
					show: { resource: ['prospection'], operation: ['saveFilter'] },
				},
			},
			{
				displayName: 'Filtros (JSON)',
				name: 'prospeccaoDadosFiltro',
				type: 'json',
				required: true,
				default: '{}',
				description: 'Os filtros a salvar, na mesma estrutura do corpo de contagem/exportação',
				displayOptions: {
					show: { resource: ['prospection'], operation: ['saveFilter'] },
				},
			},

			// B2B Meta operations (metadados de filtro — todos GRÁTIS)
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['b2bMeta'] } },
				options: [
					{
						name: 'Estrutura De Filtros',
						value: 'filterStructure',
						action: 'Obter a estrutura de filtros B2B',
					},
					{
						name: 'Opções De Filtros',
						value: 'filterOptions',
						action: 'Obter as opções dos filtros categóricos B2B',
					},
					{
						name: 'Autocomplete',
						value: 'autocomplete',
						action: 'Buscar valores válidos para um filtro B2B',
					},
				],
				default: 'filterOptions',
			},

			// Prospecção B2C operations
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['prospection'] } },
				options: [
					{
						name: 'Contar Pessoas',
						value: 'countPersons',
						action: 'Contar pessoas na base da receita',
					},
					{
						name: 'Exportar Pessoas',
						value: 'exportPersons',
						action: 'Exportar pessoas da base da receita',
					},
					{
						name: 'Contar Empresas',
						value: 'countCompanies',
						action: 'Contar empresas na base da receita',
					},
					{
						name: 'Exportar Empresas',
						value: 'exportCompanies',
						action: 'Exportar empresas da base da receita',
					},
					{
						name: 'Obter Resultado',
						value: 'getResult',
						action: 'Obter o resultado de uma prospecção',
					},
					{
						name: 'Listar Perfis',
						value: 'listProfiles',
						action: 'Listar os perfis de prospecção',
					},
					{
						name: 'Salvar Filtro',
						value: 'saveFilter',
						action: 'Salvar um filtro de prospecção',
					},
					{
						name: 'Listar Filtros Salvos',
						value: 'listSavedFilters',
						action: 'Listar os filtros de prospecção salvos',
					},
				],
				default: 'countCompanies',
			},

			// Auxiliares operations (vocabulário para montar filtro válido)
			{
				displayName: 'Operation',
				name: 'operation',
				type: 'options',
				noDataExpression: true,
				displayOptions: { show: { resource: ['auxiliary'] } },
				options: [
					{ name: 'Cidades', value: 'cities', action: 'Listar cidades' },
					{ name: 'Bairros', value: 'neighborhoods', action: 'Listar bairros' },
					{ name: 'CNAEs', value: 'cnae', action: 'Listar CNAEs' },
					{ name: 'Setores CNAE', value: 'sectorCnae', action: 'Listar setores CNAE' },
					{ name: 'Profissões (CBO)', value: 'cbo', action: 'Listar profissões CBO' },
				],
				default: 'cities',
			},

			// Enrichment - getStatus
			{
				displayName: 'ID do Enriquecimento',
				name: 'enrichmentId',
				type: 'string',
				required: true,
				default: '',
				displayOptions: {
					show: { resource: ['enrichment'], operation: ['getStatus'] },
				},
			},
		],
	};

	async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
		const items = this.getInputData();
		const returnData: INodeExecutionData[] = [];
		const resource = this.getNodeParameter('resource', 0) as string;
		const operation = this.getNodeParameter('operation', 0) as string;
		const baseUrl = 'https://api.datastone.com.br/v1';

		const credentials = await this.getCredentials('dataStoneApi');
		const apiKey = credentials.apiKey as string;

		const doGet = async (path: string, qs: Record<string, string> = {}) => {
			return await this.helpers.httpRequest({
				method: 'GET',
				url: `${baseUrl}${path}`,
				qs,
				headers: {
					Authorization: `Token ${apiKey}`,
				},
				json: true,
			});
		};

		// Ponto e vírgula é o separador preferido porque vários valores da API CONTÊM
		// vírgula: o rótulo de CNAE ("6201500 - Desenvolvimento de programas, sob
		// encomenda"), a localização B2B ("Cidade, UF"), razões sociais. A vírgula
		// segue aceita quando não há ponto e vírgula, para não quebrar os fluxos que
		// já existem com valores simples.
		const toArray = (value: string, separator?: string): string[] => {
			if (!value) return [];
			const sep = separator ?? (value.includes(';') ? ';' : ',');
			return value.split(sep).map((s) => s.trim()).filter((s) => s);
		};

		// atividades_cnae casa o RÓTULO COMPLETO "{id_cnae} - {ds_cnae}". Código solto
		// não casa com NADA e a busca é cobrada mesmo voltando vazia, então vale mais
		// recusar aqui, de graça, do que deixar o cliente pagar por um filtro que a API
		// ignora. Aqui o separador é ponto e vírgula fixo: o rótulo tem vírgula dentro.
		const rotulosCnae = (value: string): string[] => {
			const itens = toArray(value, ';');
			for (const item of itens) {
				if (!/^\d{7}\s*-\s*.+$/.test(item)) {
					const motivo = /^[\d\s/.-]+$/.test(item)
						? `"${item}" é só o código`
						: `"${item}" não começa com o código CNAE de 7 dígitos`;
					throw new NodeApiError(this.getNode(), {} as JsonObject, {
						message: `Atividade CNAE em formato inválido: ${motivo}`,
						description:
							'A busca B2B casa o rótulo completo "{código} - {descrição}" (ex.: "6201500 - Desenvolvimento de programas de computador, sob encomenda"). Pegue o valor pronto em B2B Filtros E Autocomplete > Autocomplete, campo Atividade CNAE, e separe múltiplos rótulos por ponto e vírgula. Nenhum crédito foi consumido.',
					});
				}
			}
			return itens;
		};

		const buildFiltrosPessoa = (raw: IDataObject): IDataObject => {
			const filtros: IDataObject = {};
			if (raw.cargos) filtros.cargos = toArray(raw.cargos as string);
			if (raw.departamentos && (raw.departamentos as string[]).length) filtros.departamentos = raw.departamentos;
			if (raw.niveis_senioridade && (raw.niveis_senioridade as string[]).length) filtros.niveis_senioridade = raw.niveis_senioridade;
			if (raw.habilidades) filtros.habilidades = toArray(raw.habilidades as string);
			if (raw.localizacoes) filtros.localizacoes = toArray(raw.localizacoes as string, ';');
			if (raw.estados && (raw.estados as string[]).length) filtros.estados = raw.estados;
			if (raw.has_email) filtros.has_email = true;
			if (raw.has_phone) filtros.has_phone = true;
			if (raw.has_linkedin) filtros.has_linkedin = true;
			if (raw.has_cnpj) filtros.has_cnpj = true;
			return filtros;
		};

		const buildFiltrosEmpresa = (raw: IDataObject): IDataObject => {
			const filtros: IDataObject = {};
			if (raw.nome_empresa) filtros.nome_empresa = toArray(raw.nome_empresa as string);
			if (raw.estados && (raw.estados as string[]).length) filtros.estados = raw.estados;
			if (raw.localizacoes) filtros.localizacoes = toArray(raw.localizacoes as string, ';');
			if (raw.setores) filtros.setores = toArray(raw.setores as string);
			if (raw.atividades_cnae) filtros.atividades_cnae = rotulosCnae(raw.atividades_cnae as string);
			if (raw.tamanhos_empresa && (raw.tamanhos_empresa as string[]).length) filtros.tamanhos_empresa = raw.tamanhos_empresa;
			if (raw.tipos_trabalho && (raw.tipos_trabalho as string[]).length) filtros.tipos_trabalho = raw.tipos_trabalho;
			if (raw.naturezas_juridicas && (raw.naturezas_juridicas as number[]).length) filtros.naturezas_juridicas = raw.naturezas_juridicas;
			if (raw.incluir_mei) filtros.incluir_mei = true;
			if (raw.tem_email) filtros.tem_email = true;
			if (raw.tem_telefone) filtros.tem_telefone = true;
			if (raw.tem_linkedin) filtros.tem_linkedin = true;
			if (raw.tem_cnpj) filtros.tem_cnpj = true;
			if (raw.especialidades) filtros.especialidades = toArray(raw.especialidades as string);
			if (raw.setores_cnae) filtros.setores_cnae = toArray(raw.setores_cnae as string);
			// faixa_receita: mínimo e máximo são independentes na API — mandar um sozinho
			// não pode arrastar o outro com zero, que a proc leria como "a partir de 0".
			const receitaMin = Number(raw.receita_minima) || 0;
			const receitaMax = Number(raw.receita_maxima) || 0;
			if (receitaMin || receitaMax) {
				const faixaReceita: IDataObject = {};
				if (receitaMin) faixaReceita.receita_minima = receitaMin;
				if (receitaMax) faixaReceita.receita_maxima = receitaMax;
				filtros.faixa_receita = faixaReceita;
			}
			// data_fundacao é faixa de ANO, não de data: a base B2B guarda só
			// ANO_FUNDACAO. A API aceita um limite sozinho e completa o outro com a
			// borda da faixa, então "a partir de 2015" não obriga a inventar um teto.
			const anoMin = Number(raw.ano_fundacao_min) || 0;
			const anoMax = Number(raw.ano_fundacao_max) || 0;
			if (anoMin || anoMax) {
				const dataFundacao: IDataObject = {};
				if (anoMin) dataFundacao.data_inicio = anoMin;
				if (anoMax) dataFundacao.data_fim = anoMax;
				filtros.data_fundacao = dataFundacao;
			}
			return filtros;
		};

		// Enriquecimento SÍNCRONO: a API tem três desfechos e cada um pede tratamento
		// diferente — 200 concluiu, 202 segue processando (o header Location aponta o
		// /b2b/status/{id}) e 429 é controle de carga, SEM crédito debitado. Com o
		// httpRequest padrão o 202 chegaria como sucesso indistinguível do 200 e o 429
		// como erro cru, então aqui a resposta vem completa e o status é interpretado.
		const doPostSync = async (path: string, body: Record<string, unknown>) => {
			const resposta = await this.helpers.httpRequest({
				method: 'POST',
				url: `${baseUrl}${path}`,
				body,
				headers: {
					Authorization: `Token ${apiKey}`,
					'Content-Type': 'application/json',
				},
				json: true,
				returnFullResponse: true,
				ignoreHttpStatusErrors: true,
			});

			const status = resposta.statusCode;
			const corpo = (resposta.body ?? {}) as IDataObject;
			const headers = (resposta.headers ?? {}) as IDataObject;

			if (status === 202) {
				return {
					...corpo,
					_sync_status: 'processing',
					_status_path: headers.location ?? null,
				} as IDataObject;
			}

			if (status === 429) {
				const esperar = headers['retry-after'] ?? '5';
				throw new NodeApiError(this.getNode(), corpo as JsonObject, {
					message: 'Sem vaga para execução síncrona neste momento',
					description: `Nenhum crédito foi debitado. Tente de novo em ${esperar}s (ative "Retry On Fail" neste nó) ou use a operação Enriquecer, que é assíncrona e não tem esse teto.`,
					httpCode: '429',
				});
			}

			if (status >= 400) {
				throw new NodeApiError(this.getNode(), corpo as JsonObject, {
					httpCode: String(status),
				});
			}

			return corpo;
		};

		// Prospecção B2C: traduz a coleção da tela para o corpo que a API espera.
		// Os pares min/max viram arrays de objetos {lower, upper} — é o formato da
		// Receita, diferente do {receita_minima, receita_maxima} do B2B.
		const faixa = (
			lower: unknown,
			upper: unknown,
			comoTexto = true,
		): IDataObject[] | undefined => {
			const l = Number(lower) || 0;
			const u = Number(upper) || 0;
			if (!l && !u) return undefined;
			const item: IDataObject = {};
			if (l) item.lower = comoTexto ? String(l) : l;
			if (u) item.upper = comoTexto ? String(u) : u;
			return [item];
		};

		const buildFiltrosProspeccao = (raw: IDataObject, alvo: 'pessoas' | 'empresas'): IDataObject => {
			const corpo: IDataObject = {};
			if (raw.name) corpo.name = raw.name;
			// "Cidade - UF" com hífen, e bairro com três partes: fora do formato a API
			// recusa a requisição inteira nomeando os filtros de localização.
			if (raw.cities) corpo.cities = toArray(raw.cities as string, ';');
			if (raw.states) corpo.states = toArray(raw.states as string, ';');
			if (raw.ddds) corpo.ddds = toArray(raw.ddds as string, ';');
			if (raw.neighborhoodies) {
				corpo.neighborhoodies = toArray(raw.neighborhoodies as string, ';');
			}

			if (alvo === 'pessoas') {
				if (raw.cbo_codes) corpo.cbo_codes = toArray(raw.cbo_codes as string, ';');
				if (raw.gender) corpo.gender = raw.gender;
				if (raw.match_profile) {
					corpo.match_profile = toArray(raw.match_profile as string, ';');
				}
				if ((raw.contact_channels as string[])?.length) {
					corpo.contact_channels = raw.contact_channels;
				}
				const idade = faixa(raw.age_lower, raw.age_upper);
				if (idade) corpo.age = idade[0]; // `age` é objeto único, não array
				const renda = faixa(raw.income_lower, raw.income_upper);
				if (renda) corpo.estimated_income = renda;
				if (raw.birthday_start || raw.birthday_end) {
					const nascimento: IDataObject = {};
					if (raw.birthday_start) nascimento.start_date = raw.birthday_start;
					if (raw.birthday_end) nascimento.end_date = raw.birthday_end;
					corpo.birthday = nascimento;
				}
			} else {
				if (raw.cnae_codes) corpo.cnae_codes = toArray(raw.cnae_codes as string, ';');
				if (raw.sector_codes) corpo.sector_codes = toArray(raw.sector_codes as string, ';');
				if (raw.nature_codes) corpo.nature_codes = toArray(raw.nature_codes as string, ';');
				if (raw.headquarter_type) corpo.headquarter_type = raw.headquarter_type;
				if ((raw.company_type as string[])?.length) corpo.company_type = raw.company_type;
				if (raw.mei_type) corpo.mei_type = raw.mei_type;
				if (raw.simple_type) corpo.simple_type = raw.simple_type;
				if (raw.import_export) corpo.import_export = raw.import_export;
				// estimated_employees e vehicles são contagens: número, não texto.
				const funcionarios = faixa(raw.employees_lower, raw.employees_upper, false);
				if (funcionarios) corpo.estimated_employees = funcionarios;
				const veiculos = faixa(raw.vehicles_lower, raw.vehicles_upper, false);
				if (veiculos) corpo.vehicles = veiculos;
				const receita = faixa(raw.revenue_lower, raw.revenue_upper);
				if (receita) corpo.revenues = receita;
				const capital = faixa(raw.capital_lower, raw.capital_upper);
				if (capital) corpo.capitals = capital;
				if (raw.created_start || raw.created_end) {
					const abertura: IDataObject = {};
					if (raw.created_start) abertura.lower = raw.created_start;
					if (raw.created_end) abertura.upper = raw.created_end;
					corpo.estimated_created = [abertura];
				}
			}
			return corpo;
		};

		const doPost = async (path: string, body: Record<string, unknown>) => {
			return await this.helpers.httpRequest({
				method: 'POST',
				url: `${baseUrl}${path}`,
				body,
				headers: {
					Authorization: `Token ${apiKey}`,
					'Content-Type': 'application/json',
				},
				json: true,
			});
		};

		for (let i = 0; i < items.length; i++) {
			try {
				let responseData;

				// ── Person ──
				if (resource === 'person') {
					if (operation === 'getByCpf') {
						const cpf = this.getNodeParameter('cpf', i) as string;
						const fields = this.getNodeParameter('fields', i, '') as string;
						const qs: Record<string, string> = { cpf };
						if (fields) qs.fields = fields;
						responseData = await doGet('/persons/', qs);
					} else if (operation === 'search') {
						const filters = this.getNodeParameter('personSearchFilters', i) as Record<
							string,
							string
						>;
						const qs: Record<string, string> = {};
						for (const [key, value] of Object.entries(filters)) {
							if (value) qs[key] = value;
						}
						responseData = await doGet('/persons/search/', qs);
					} else if (operation === 'advancedSearch') {
						const name = this.getNodeParameter('advSearchName', i) as string;
						const state = this.getNodeParameter('advSearchState', i, '') as string;
						const city = this.getNodeParameter('advSearchCity', i, '') as string;
						const qs: Record<string, string> = { name };
						if (state) qs.state = state;
						if (city) qs.city = city;
						responseData = await doGet('/persons/advanced-search/', qs);
					}
				}

				// ── Company ──
				else if (resource === 'company') {
					if (operation === 'getByCnpj') {
						const cnpj = this.getNodeParameter('cnpj', i) as string;
						const fields = this.getNodeParameter('fields', i, '') as string;
						const qs: Record<string, string> = { cnpj };
						if (fields) qs.fields = fields;
						responseData = await doGet('/companies/', qs);
					} else if (operation === 'search') {
						const filters = this.getNodeParameter('companySearchFilters', i) as Record<
							string,
							string
						>;
						const qs: Record<string, string> = {};
						for (const [key, value] of Object.entries(filters)) {
							if (value) qs[key] = value;
						}
						responseData = await doGet('/company/list/', qs);
					} else if (operation === 'getIntel') {
						const cnpj = this.getNodeParameter('intelCnpj', i) as string;
						responseData = await doGet('/company/intel/', { cnpj });
					} else if (operation === 'searchBranches') {
						const cnpj = this.getNodeParameter('cnpj', i) as string;
						responseData = await doGet('/company/search/filial/', { cnpj });
					}
				}

				// ── WhatsApp ──
				else if (resource === 'whatsapp') {
					if (operation === 'validate') {
						const ddd = this.getNodeParameter('ddd', i) as string;
						const phone = this.getNodeParameter('phone', i) as string;
						responseData = await doGet('/whatsapp/search/', { ddd, phone });
					} else if (operation === 'batchValidate') {
						const phones = this.getNodeParameter('phones', i) as string;
						const callbackUrl = this.getNodeParameter('callbackUrl', i, '') as string;
						const body: Record<string, unknown> = {
							phones: typeof phones === 'string' ? JSON.parse(phones) : phones,
						};
						if (callbackUrl) body.callback_url = callbackUrl;
						responseData = await doPost('/whatsapp/batch/', body);
					}
				}

				// ── B2B Person ──
				else if (resource === 'b2bPerson') {
					if (operation === 'prospect') {
						const pagina = this.getNodeParameter('pagina', i) as number;
						const porPagina = this.getNodeParameter('porPagina', i) as number;
						const chaveCache = this.getNodeParameter('chaveCache', i, '') as string;
						const rawPessoa = this.getNodeParameter('filtrosPessoa', i, {}) as IDataObject;
						const rawEmpresa = this.getNodeParameter('filtrosEmpresa', i, {}) as IDataObject;
						const urlWebhook = this.getNodeParameter('urlWebhook', i, '') as string;

						const body: Record<string, unknown> = {
							pagina,
							por_pagina: porPagina,
							filtros_pessoa: buildFiltrosPessoa(rawPessoa),
							filtros_empresa: buildFiltrosEmpresa(rawEmpresa),
						};
						if (chaveCache) body.chave_cache = chaveCache;
						if (urlWebhook) body.url_webhook = urlWebhook;
						const raw = await doPost('/b2b/persons/', body);
						if (raw && Array.isArray(raw.dados)) {
							for (const item of raw.dados) {
								returnData.push({ json: { ...item, _chave_cache: raw.chave_cache, _total: raw.total } as IDataObject });
							}
							continue;
						}
						responseData = raw;
					} else if (operation === 'enrich') {
						const linkedin = this.getNodeParameter('contatoLinkedin', i, '') as string;
						const email = this.getNodeParameter('contatoEmail', i, '') as string;
						const id = this.getNodeParameter('contatoId', i, '') as string;
						const urlWebhook = this.getNodeParameter('urlWebhook', i, '') as string;
						const contato: IDataObject = {};
						if (linkedin) contato.url_linkedin = linkedin;
						if (email) contato.email = email;
						if (id) contato.id_pessoa = Number(id);
						const body: Record<string, unknown> = { contato };
						if (urlWebhook) body.url_webhook = urlWebhook;
						responseData = await doPost('/b2b/persons/enrich', body);
					} else if (operation === 'enrichSync') {
						// Os nomes têm de ser exatamente estes: `linkedin_url` e `person_id`
						// NÃO são aceitos e um campo com nome diferente é descartado em
						// silêncio, cobrando o crédito por um enriquecimento mais pobre.
						const linkedin = this.getNodeParameter('syncPessoaLinkedin', i, '') as string;
						const email = this.getNodeParameter('syncPessoaEmail', i, '') as string;
						const cpf = this.getNodeParameter('syncPessoaCpf', i, '') as string;
						const id = this.getNodeParameter('syncPessoaId', i, '') as string;
						const contato: IDataObject = {};
						if (linkedin) contato.url_linkedin = linkedin;
						if (email) contato.email = email;
						if (cpf) contato.cpf = cpf;
						if (id) contato.id_pessoa = Number(id);
						responseData = await doPostSync('/b2b/persons/enrich/sync', { contato });
					} else if (operation === 'enrichBulk') {
						const contatos = this.getNodeParameter('contatos', i) as string;
						const urlWebhook = this.getNodeParameter('urlWebhook', i, '') as string;
						const body: Record<string, unknown> = {
							contatos: typeof contatos === 'string' ? JSON.parse(contatos) : contatos,
						};
						if (urlWebhook) body.url_webhook = urlWebhook;
						responseData = await doPost('/b2b/persons/enrich/bulk', body);
					}
				}

				// ── B2B Company ──
				else if (resource === 'b2bCompany') {
					if (operation === 'prospect') {
						const pagina = this.getNodeParameter('pagina', i) as number;
						const porPagina = this.getNodeParameter('porPagina', i) as number;
						const chaveCache = this.getNodeParameter('chaveCache', i, '') as string;
						const rawEmpresa = this.getNodeParameter('filtrosEmpresa', i, {}) as IDataObject;

						const body: Record<string, unknown> = {
							pagina,
							por_pagina: porPagina,
							filtros_empresa: buildFiltrosEmpresa(rawEmpresa),
						};
						if (chaveCache) body.chave_cache = chaveCache;
						const raw = await doPost('/b2b/companies/', body);
						if (raw && Array.isArray(raw.dados)) {
							for (const item of raw.dados) {
								returnData.push({ json: { ...item, _chave_cache: raw.chave_cache, _total: raw.total } as IDataObject });
							}
							continue;
						}
						responseData = raw;
					} else if (operation === 'enrich') {
						const cnpj = this.getNodeParameter('contatoCnpj', i, '') as string;
						const linkedin = this.getNodeParameter('contatoLinkedin', i, '') as string;
						const urlWebhook = this.getNodeParameter('urlWebhook', i, '') as string;
						const contato: IDataObject = {};
						if (cnpj) contato.cnpj = cnpj;
						if (linkedin) contato.url_linkedin = linkedin;
						const body: Record<string, unknown> = { contato };
						if (urlWebhook) body.url_webhook = urlWebhook;
						responseData = await doPost('/b2b/companies/enrich', body);
					} else if (operation === 'enrichSync') {
						const cnpj = this.getNodeParameter('syncEmpresaCnpj', i, '') as string;
						const linkedin = this.getNodeParameter('syncEmpresaLinkedin', i, '') as string;
						const contato: IDataObject = {};
						if (cnpj) contato.cnpj = cnpj;
						if (linkedin) contato.url_linkedin = linkedin;
						responseData = await doPostSync('/b2b/companies/enrich/sync', { contato });
					} else if (operation === 'enrichBulk') {
						const contatos = this.getNodeParameter('contatos', i) as string;
						const urlWebhook = this.getNodeParameter('urlWebhook', i, '') as string;
						const body: Record<string, unknown> = {
							contatos: typeof contatos === 'string' ? JSON.parse(contatos) : contatos,
						};
						if (urlWebhook) body.url_webhook = urlWebhook;
						responseData = await doPost('/b2b/companies/enrich/bulk', body);
					}
				}

				// ── Enrichment ──
				else if (resource === 'enrichment') {
					if (operation === 'listLayouts') {
						responseData = await doGet('/enrichment/layouts/');
					} else if (operation === 'create') {
						const enrichmentName = this.getNodeParameter('enrichmentName', i) as string;
						const layoutId = this.getNodeParameter('layoutId', i) as string;
						const parameters = this.getNodeParameter(
							'enrichmentParameters',
							i,
							'{}',
						) as string;
						const fileBase64 = this.getNodeParameter('fileBase64', i, '') as string;
						const callbackEmail = this.getNodeParameter('callbackEmail', i, '') as string;

						const body: Record<string, unknown> = {
							name: enrichmentName,
							layout_id: layoutId,
							parameters:
								typeof parameters === 'string' ? JSON.parse(parameters) : parameters,
						};
						if (fileBase64) body.file = fileBase64;
						if (callbackEmail) body.callback_email = callbackEmail;
						responseData = await doPost('/enrichment/', body);
					} else if (operation === 'getStatus') {
						const enrichmentId = this.getNodeParameter('enrichmentId', i) as string;
						responseData = await doGet(`/enrichment/${enrichmentId}/result/`);
					}
				}

				// ── B2B Filtros e Autocomplete (tudo grátis) ──
				else if (resource === 'b2bMeta') {
					if (operation === 'filterStructure') {
						responseData = await doGet('/b2b/filter-structure/');
					} else if (operation === 'filterOptions') {
						responseData = await doGet('/b2b/filter-options/');
					} else if (operation === 'autocomplete') {
						const term = this.getNodeParameter('autocompleteTerm', i) as string;
						const field = this.getNodeParameter('autocompleteField', i) as string;
						responseData = await doGet('/b2b/search/', { term, field });
					}
				}

				// ── Prospecção B2C (base da Receita) ──
				else if (resource === 'prospection') {
					const ehPessoas = operation === 'countPersons' || operation === 'exportPersons';
					const ehExport = operation === 'exportPersons' || operation === 'exportCompanies';

					if (
						operation === 'countPersons' ||
						operation === 'exportPersons' ||
						operation === 'countCompanies' ||
						operation === 'exportCompanies'
					) {
						const raw = this.getNodeParameter(
							ehPessoas ? 'filtrosProspeccaoPessoas' : 'filtrosProspeccaoEmpresas',
							i,
							{},
						) as IDataObject;
						const extra = this.getNodeParameter('prospeccaoFiltrosExtra', i, '{}') as string;

						const body: Record<string, unknown> = {
							export: ehExport,
							...buildFiltrosProspeccao(raw, ehPessoas ? 'pessoas' : 'empresas'),
							...(typeof extra === 'string' ? JSON.parse(extra || '{}') : extra),
						};

						if (ehExport) {
							body.quantity = this.getNodeParameter('prospeccaoQuantidade', i) as number;
							body.file_formatting = this.getNodeParameter(
								'prospeccaoFormato',
								i,
								'excel',
							) as string;
							const callback = this.getNodeParameter(
								'prospeccaoCallbackEmail',
								i,
								'',
							) as string;
							if (callback) body.callback_email = callback;
							// `name` nomeia o job e a API o exige na exportação; sem ele a
							// resposta é 400 depois de o filtro já ter sido montado.
							if (!body.name) {
								throw new NodeApiError(
									this.getNode(),
									{} as JsonObject,
									{
										message: 'O filtro Nome é obrigatório na exportação',
										description:
											'A API usa o Nome como nome do job de prospecção. Adicione o filtro "Nome" na coleção de filtros. A contagem funciona sem ele.',
									},
								);
							}
						}

						responseData = await doPost(
							ehPessoas ? '/persons/prospect/' : '/company/prospect/',
							body,
						);
					} else if (operation === 'getResult') {
						const jobId = this.getNodeParameter('prospeccaoJobId', i) as string;
						responseData = await doGet(`/prospection/${jobId}/result/`);
					} else if (operation === 'listProfiles') {
						responseData = await doGet('/persons/prospect/profile/');
					} else if (operation === 'saveFilter') {
						const tipo = this.getNodeParameter('prospeccaoTipoFiltro', i) as string;
						const nome = this.getNodeParameter('prospeccaoNomeFiltro', i) as string;
						const dados = this.getNodeParameter('prospeccaoDadosFiltro', i, '{}') as string;
						responseData = await doPost('/prospection/filters/', {
							filter_name: nome,
							filter_type: tipo === 'person' ? 1 : 2,
							data: typeof dados === 'string' ? JSON.parse(dados || '{}') : dados,
						});
					} else if (operation === 'listSavedFilters') {
						const tipo = this.getNodeParameter('prospeccaoTipoFiltro', i) as string;
						responseData = await doGet(
							tipo === 'person'
								? '/prospection/filters/list_person/'
								: '/prospection/filters/list_company/',
						);
					}
				}

				// ── Auxiliares (vocabulário para montar filtro válido) ──
				else if (resource === 'auxiliary') {
					const qs: Record<string, string> = {};
					if (operation === 'cities' || operation === 'neighborhoods') {
						const nome = this.getNodeParameter('auxName', i, '') as string;
						const uf = this.getNodeParameter('auxState', i, '') as string;
						if (nome) qs.name = nome;
						if (uf) qs.state = uf;
						if (operation === 'neighborhoods') {
							const cidade = this.getNodeParameter('auxCity', i, '') as string;
							if (cidade) qs.city = cidade;
							responseData = await doGet('/geo/neighborhood/', qs);
						} else {
							responseData = await doGet('/geo/city/', qs);
						}
					} else {
						const codigo = this.getNodeParameter('auxCode', i, '') as string;
						const descricao = this.getNodeParameter('auxDescription', i, '') as string;
						const pagina = this.getNodeParameter('auxPage', i, 1) as number;
						const porPagina = this.getNodeParameter('auxPageSize', i, 50) as number;
						if (codigo) qs.code = codigo;
						if (descricao) qs.description = descricao;
						if (pagina) qs.page = String(pagina);
						if (porPagina) qs.page_size = String(porPagina);
						const rota =
							operation === 'cnae'
								? '/cnae/'
								: operation === 'sectorCnae'
									? '/sector/cnae/'
									: '/cbo/';
						responseData = await doGet(rota, qs);
					}
				}

				// ── Account ──
				else if (resource === 'account') {
					if (operation === 'getBalance') {
						responseData = await doGet('/balance');
					}
				}

				if (typeof responseData === 'string') {
					try {
						responseData = JSON.parse(responseData);
					} catch {
						responseData = { raw: responseData };
					}
				}

				if (Array.isArray(responseData)) {
					returnData.push(
						...responseData.map((item) => ({ json: item as IDataObject })),
					);
				} else {
					returnData.push({ json: responseData as IDataObject });
				}
			} catch (error) {
				if (this.continueOnFail()) {
					returnData.push({
						json: { error: (error as Error).message } as IDataObject,
					});
					continue;
				}
				const e = error as any;
				const msg = e?.message || 'Unknown error';
				const statusCode = e?.statusCode || e?.response?.status || e?.httpCode;
				const responseBody = e?.response?.data || e?.body || e?.description;
				const nodeError = new Error(`${msg}${statusCode ? ` (HTTP ${statusCode})` : ''}${responseBody ? ': ' + JSON.stringify(responseBody) : ''}`);
				throw nodeError;
			}
		}

		return [returnData];
	}
}
