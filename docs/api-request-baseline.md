# API 请求迁移基线

本文档定义接入或迁移业务模块时必须遵循的 API 请求、开发代理和本地 Mock 目标契约。它是项目级补充；通用的请求实例、OpenAPI/SDK、数据契约、错误处理和 Query 规则继续遵循目标仓库的工程约定与现有源码契约。

本文件定义迁移完成后的唯一允许形态。当前仍可能存在不符合本文的旧代码、环境变量和测试；它们是待迁移的错误历史，不构成例外、兼容承诺或验收基线。

## 统一浏览器 API 根路径

所有环境中的浏览器请求统一使用：

```text
/dysec/api/<micro-service-name>/<endpoint>
```

浏览器 API 根由 `apps/web/src/constants/api.ts` 的 `API_BASE_PATH` 唯一拥有；其当前 wire-level 值为 `/dysec/api`。业务 Service 只提供以 `/` 开头的相对路径，并由自身追加微服务名和端点；例如 `/<micro-service-name>/<endpoint>`。Service 不得重复拼接 API 根，也不得直接使用网关或服务端绝对地址。

| 职责         | 唯一入口                                           | 目标约束                                                                                                                                                           |
| ------------ | -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| API 根路径   | `apps/web/src/constants/api.ts` 的 `API_BASE_PATH` | 当前值为 `/dysec/api`；请求、Mock 和开发代理都复用常量，不各自维护根路径。                                                                                         |
| 请求实例配置 | `apps/web/src/configs/request.ts`                  | `baseURL` 复用 `API_BASE_PATH`；实例名由 `API_REQUEST_INSTANCE_NAME` 统一维护，不绑定任何业务域；错误回调直接使用请求包公开的 `normalizeError`，不额外包装、解析。 |
| 请求实例导出 | `apps/web/src/services/request.ts` 的 `apiRequest` | 由 `configureRequest()` 初始化；全部业务 Service 复用它，不创建第二个实例或 Axios 客户端。                                                                         |
| 初始化时机   | `apps/web/src/main.tsx`                            | 在应用渲染与业务请求之前调用 `configureRequest()`。                                                                                                                |

请求基础设施继续由 `@dayu-sec/bizlib-request` 的根入口提供。业务模块不得从其底层实现、构建目录或 `@seed-fe/request` 深层导入，也不得绕过 `apiRequest` 直接用 Axios 发起业务 API 请求。

## 所有环境的单一边界与非兼容迁移

无论是本地 Mock、Vite 开发代理、集成环境还是生产网关，浏览器侧唯一的 API 边界都是 `API_BASE_PATH`。微服务名和端点只存在于这个边界之后；模块不得保留或新增独立浏览器基址或独立请求实例。

迁移以当前基线为准，不兼容历史实现：

- 原有按业务域配置的 `baseURL`、独立 `VITE_*` API 地址、独立 Axios 或 `HttpRequest` 实例，均为待删除或替换的历史实现。
- 业务代码、环境变量或第二请求实例中原有按微服务匹配、重写路径或指定上游的代理规则，均为待删除或替换的历史实现。
- 本地联调的唯一路由例外是 `apps/web/proxy.local.jsonc` 中遵循 `proxy.schema.json` 的 `server.proxy.api`；它由 `getProxyConfig()` 统一装配，不改变浏览器 API 根、业务 Service 或请求实例。
- 断言旧路径、业务专属代理或独立请求实例的测试，均为待迁移的错误历史；迁移后应改写为当前浏览器边界和本地代理配置契约的测试。
- 旧实现和遗留测试只用于定位迁移范围，不能作为兼容性要求、回归基线或验收条件。新实现不得通过双写请求、fallback 路径、兼容开关或第二套基础设施让它们继续成立。

开发期浏览器路径和业务 Service 调用方式始终一致。`getProxyConfig()` 先装配 `proxy.local.jsonc` 的本地规则；未被本地规则接管的请求，才由 `API_BASE_PATH` 派生的网关规则处理。未配置本地规则和网关时，当前 Vite 进程可进入 Mock-only 模式。

## 业务模块迁移规则

1. 先确认每个端点的 OpenAPI 文档或已安装 SDK/API 物料；同一端点只保留一个调用真源。
2. 将调用放在 `apps/web/src/services/<domain>/` 的明确业务文件中。页面、组件和 TanStack Query 的 query function 不直接拼 HTTP 路径。
3. 调用 `apiRequest` 时只提供 `/<micro-service-name>/<endpoint>`。不要加入 `API_BASE_PATH` 的当前值、`/api`、`/api/v1`、`VITE_APP_BASE`，也不要自行处理重复斜杠。
4. 沿用已有请求实例的认证、语言、超时、拦截器、错误标准化与认证失败处理；模块不得重新注册同名实例、拦截器或全局错误提示。
5. 需要 SDK 适配时，将当前的 live `apiRequest` 作为 SDK 的 `HttpClient` 薄适配来源；不要新增第二套请求配置或 SDK 全局 client 所有权。

如发现已有模块不符合本节路径，先确认其实际契约和迁移范围，再删除或改写旧实现与其测试；不要通过保留旧根路径、双写请求、fallback 路径、兼容开关或业务专属代理制造兼容分支。

## Vite 开发代理与多微服务本地联调

开发代理的唯一实现是 `apps/web/proxy.ts` 中的 `getProxyConfig()`：

- `apps/web/proxy.local.jsonc` 是开发者唯一的本地配置入口，也是源码唯一读取的文件，承载 `"server.port"`、`"mock"`、`"server.proxy.token"` 和 `"server.proxy.api"`；字段契约以 `proxy.schema.json` 为准。文件名保留 `proxy.` 前缀是历史沿革，不再限定它只配置代理。
- 格式固定为 JSONC：允许注释和尾随逗号，与 `tsconfig.json`、VS Code `settings.json` 一致，注释掉最后一项后留下的逗号不算错误。
- 配置项由 `proxy.schema.json` 通过文件顶部的 `$schema` 在编辑期约束（根、`mock`、每条规则、`rewrite` 四层 `additionalProperties: false`），运行时只解析不校验。取值错误由 `URL`、`RegExp`、Vite 自身在装配或运行时抛出，不在解析层重复兜底。
- `getProxyConfig()` 按路径 key 的字符串长度从长到短装配本地规则；相同长度保留声明顺序。开发者可以配置包括 `API_BASE_PATH` 当前值在内的任意路径，其覆盖范围由配置者负责。
- 大多数本地服务只配置路径 key 和 `target`，完整请求路径会原样转发；只有本地后端不接收完整浏览器路径时才配置 `{ "pattern": string, "replacement": string }` 正则 `rewrite`，v1 不支持正则 flags。
- `getProxyConfig()` 在没有本地 API 根规则时，才使用非空 `DEV_API_URL` 创建 `${API_BASE_PATH}/` 网关兜底规则。`DEV_API_URL` 是 Vite 进程内部配置，不是业务 Service 或本地服务配置入口。
- `"server.proxy.token"` 是共享 Bearer Token，默认发给**全部**代理规则和网关兜底规则。单条规则的解析优先级为 `headers.Authorization` > 规则 `token` > 共享 `server.proxy.token` > `DEV_API_TOKEN`；声明即终结——某一层写了 `token` 就不再向上继承，去除首尾空白后为空表示该规则显式关闭 Authorization。
- 共享 Token 的扩散面大于单条网关规则，本地规则的 target 可能是同事机器或临时环境。启动摘要按规则标注 `[token: rule | shared | env | headers]`，只标来源不打印 Token 值，用于核对 Token 发给了哪些服务。
- 未配置本地代理文件和网关时，返回空代理配置，Mock-only 开发模式不能形成自代理。删除或注释本地规则后，未命中的请求会继续按当前网关/Mock 配置处理。
- 本地配置文件变化后 Vite 自动重启并重新读取规则。开发服务器按实际匹配顺序输出全部 API 代理的路径 key 与脱敏 target origin，不区分本地、线上或兜底用途；没有任何代理规则时提示未配置 API 网关。HTTP 响应使用 `X-Dev-Proxy-Target` 和 `X-Dev-Proxy-Rule` 标明命中规则，不向浏览器暴露完整 target、Token 或请求头。
- `.env.development.local` 是 Vite 官方机制，继续被读取但已弱化为兜底，日常开发不需要创建。**取值类**配置文件优先于 env：`DEV_SERVER_PORT` 兜底 `"server.port"`、`DEV_API_TOKEN` 兜底 `"server.proxy.token"`，文件声明了同名项即以文件为准。**开关类**的 Mock 是「或」语义：`pnpm dev:mock`、`DEV_MOCK=true`、`"mock": { "enabled": true }` 任一成立即开启，`DEV_MOCK=true` 不会被文件里的 `"enabled": false` 否决——命令行形态必须能压过配置文件，否则 `pnpm dev:mock` 会被一份历史配置挡掉。`DEV_API_URL` 的等价写法是把 API 根路径直接写成一条本地规则。这些变量仅供 Vite 进程读取，不得改为 `VITE_*`，不得在浏览器代码中读取，也不得提交真实地址或凭据。
- 影响构建产物或进入浏览器的变量（如 `VITE_APP_BASE`）留在 `.env` 与 `VITE_*` 机制，不迁入本地配置文件——构建结果不能依赖开发者本机的 Git 忽略文件。

## 本地 Mock

**背景。** `vite-plugin-mock-dev-server` 的默认行为是「装了就生效」：插件一经注册即接管匹配请求。这在单人、少量接口的场景下没有问题，但在多人协作和长期演进下会产生三种确定的故障：

- **误提交导致他人被静默拦截。** 某个开发者为联调开启 Mock 并把 mock 文件一并提交，其他人拉取后运行 `pnpm dev` 就会被拦截。Mock 响应与真实响应在浏览器里形状一致，现象通常被误判为「真实 API 失效」或「后端返回的数据不对」，排查会先怀疑后端和网关，定位成本很高。这也是要求每次命中在终端与响应头上都可见的原因——即使误开，也要能一眼分辨响应来自哪里。
- **历史 Mock 会随开关一起复活。** 接口对接完成后 mock 文件通常不删除：它是后端未就绪期间的契约样例，也用于富态 UI 的本地预览，删掉后下次要重写。为新接口开启 Mock 时，仓库中已完成的历史 Mock 会一并生效，重新劫持已经可用的真实接口。处理方式是把它们设为 `enabled: false`，而不是反转插件的默认值——反转会让照插件文档写出的 mock 变成静默失效，反而制造新的排查成本。
- **Mock 与真实后端必须共存。** 实际联调几乎总是「部分接口 Mock、其余走真实后端」，未命中的请求必须原样透传给 `server.proxy`，不能形成只有 Mock 的封闭环境。开关的实现也不能影响代理装配。

据此，本项目不沿用插件的服务级默认值：Mock 服务默认不装配，必须显式开启；端点级沿用插件自身的 `enabled` 语义。

**服务级：是否装配 Mock 服务。** `pnpm dev` 不加载 Mock 插件，全部请求走 `server.proxy`；仓库中遗留的已启用 mock 记录不会影响其他开发者的常规启动。以下三种方式等价，任一成立即开启：

1. 运行 `pnpm dev:mock`（即 `vite --mode mock`）；
2. 在 Git 忽略的 `apps/web/proxy.local.jsonc` 中配置 `"mock": { "enabled": true }`，只在本机生效；
3. 设置 `DEV_MOCK=true`。它与 `DEV_API_URL`、`DEV_API_TOKEN` 同属仅供 Vite 进程读取的开发变量，不得改为 `VITE_*`，也不进入浏览器 `import.meta.env`。

判定逻辑由 `apps/web/dev-mock.ts` 的 `resolveMockEnabled()` 单独拥有并被测试覆盖；`--mode mock` 只表达开关语义，不参与环境变量文件的选择。

**端点级：单条记录是否被拦截。** 由该条 `defineMock` 记录自身的 `enabled` 决定，沿用插件默认值 `true`。后端就绪后把对应端点设为 `enabled: false`，请求会自动透传给 `server.proxy`，不需要删除 mock 文件或改动 Vite 配置；没有匹配到任何已启用记录的请求同样自动透传。公共层不改写这个字段的语义——反转默认值会让照插件文档写出的 mock 变成静默失效，代价大于收益。

**可观测性。** 开发服务器启动时打印 `[Vite Mock]` 的启用或未启用状态。命中提示直接使用 vite-plugin-mock-dev-server 自带的 info 级日志（含 method、路径与来源 mock 文件，请求带 query/params/body 时一并输出），业务侧不再实现一份并行的命中日志。响应头直接使用插件内置的 `X-Mock-Power-By` 与指向命中文件的 `X-File-Path`，可在浏览器 DevTools Network 确认来源；公共层不改名也不注入自定义标识头。

**端点编写。**

- Mock 端点使用 `apps/web/mock/defineMock.ts` 导出的 `defineMock`。它负责补齐 API 根路径；入口中的 `url` 只写 `/<micro-service-name>/<endpoint>`，不得再次写 API 根路径。
- Mock 只在开发服务器侧匹配并返回 wire-level 响应；它不初始化请求实例、不调用业务 Service 或 SDK，也不替代业务 Service 的错误和状态处理。
- 每次新增或迁移 Mock，都要用实际业务 Service 调用验证完整 URL、method、query、body 和响应命中，而不只验证手工构造的 HTTP 请求。

## 变更验证

按实际影响范围运行已有命令：

```text
pnpm check
pnpm lint
pnpm format-check
pnpm test
pnpm build
```

修改 `apps/web/proxy.ts` 或本地配置监听时，同时覆盖并通过目标应用的代理合同测试：最长前缀、可选正则重写、常量派生网关、共享 Token 的继承与覆盖、配置校验拒绝、代理概要与 Token 来源标注、响应标识和真实 Vite 本地转发。修改 Vite Mock 配置、`apps/web/dev-mock.ts`、`apps/web/mock/defineMock.ts` 或 Mock 端点时，同时覆盖服务级开关的解析用例，并启动开发服务器验证：`pnpm dev` 不加载 Mock 且请求直连，`pnpm dev:mock` 下至少一条真实业务 Service 请求命中预期 Mock，终端输出插件命中日志且响应带 `X-Mock-Power-By`。

完成迁移后，定向检查变更范围不得重新引入 `/api/v1`、旧 `/api/` 代理匹配、业务专属代理、独立浏览器基址、独立请求实例、`/api/api`、重复 `/dysec` 或 API 根路径的重复斜杠。删除或改写断言这些历史行为的遗留测试，并以当前统一网关路径替代它们。
