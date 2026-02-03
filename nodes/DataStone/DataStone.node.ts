import {
	IDataObject,
	IExecuteFunctions,
	INodeExecutionData,
	INodeType,
	INodeTypeDescription,
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
					{ name: 'Enriquecimento (Enrichment)', value: 'enrichment' },
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
						placeholder: '6201500, 4711302',
						description: 'Códigos CNAE separados por vírgula',
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
						placeholder: '6201500, 4711302',
						description: 'Códigos CNAE separados por vírgula',
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

		const toArray = (value: string, separator = ','): string[] => {
			if (!value) return [];
			return value.split(separator).map((s) => s.trim()).filter((s) => s);
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
			return filtros;
		};

		const buildFiltrosEmpresa = (raw: IDataObject): IDataObject => {
			const filtros: IDataObject = {};
			if (raw.nome_empresa) filtros.nome_empresa = toArray(raw.nome_empresa as string);
			if (raw.estados && (raw.estados as string[]).length) filtros.estados = raw.estados;
			if (raw.localizacoes) filtros.localizacoes = toArray(raw.localizacoes as string, ';');
			if (raw.setores) filtros.setores = toArray(raw.setores as string);
			if (raw.atividades_cnae) filtros.atividades_cnae = toArray(raw.atividades_cnae as string);
			if (raw.tamanhos_empresa && (raw.tamanhos_empresa as string[]).length) filtros.tamanhos_empresa = raw.tamanhos_empresa;
			if (raw.tipos_trabalho && (raw.tipos_trabalho as string[]).length) filtros.tipos_trabalho = raw.tipos_trabalho;
			if (raw.naturezas_juridicas && (raw.naturezas_juridicas as number[]).length) filtros.naturezas_juridicas = raw.naturezas_juridicas;
			if (raw.incluir_mei) filtros.incluir_mei = true;
			if (raw.tem_email) filtros.tem_email = true;
			if (raw.tem_telefone) filtros.tem_telefone = true;
			if (raw.tem_linkedin) filtros.tem_linkedin = true;
			return filtros;
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
