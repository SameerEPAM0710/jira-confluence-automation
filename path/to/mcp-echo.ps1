$ErrorActionPreference = 'Stop'

function Write-JsonRpcResponse {
    param([hashtable]$Response)

    [Console]::Out.WriteLine(($Response | ConvertTo-Json -Compress -Depth 10))
}

while ($null -ne ($line = [Console]::In.ReadLine())) {
    try {
        $request = $line | ConvertFrom-Json -ErrorAction Stop
    }
    catch {
        Write-JsonRpcResponse @{
            jsonrpc = '2.0'
            id      = $null
            error   = @{ code = -32700; message = 'Parse error' }
        }
        continue
    }

    $method = $request.method
    if ($method -like 'notifications/*') {
        continue
    }

    $response = @{
        jsonrpc = '2.0'
        id      = $request.id
    }

    switch ($method) {
        'initialize' {
            $response.result = @{
                protocolVersion = '2025-06-18'
                capabilities    = @{ tools = @{} }
                serverInfo      = @{ name = 'echo-windows'; version = '1.0.0' }
            }
        }
        'ping' {
            $response.result = @{}
        }
        'tools/list' {
            $response.result = @{
                tools = @(
                    @{
                        name        = 'echo'
                        description = 'Return the provided message unchanged.'
                        inputSchema = @{
                            type       = 'object'
                            properties = @{ message = @{ type = 'string' } }
                            required   = @('message')
                        }
                    }
                )
            }
        }
        'tools/call' {
            if ($request.params.name -ne 'echo' -or $null -eq $request.params.arguments.message) {
                $response.error = @{ code = -32602; message = 'Expected the echo tool and a message argument.' }
            }
            else {
                $response.result = @{
                    content = @(@{ type = 'text'; text = [string]$request.params.arguments.message })
                }
            }
        }
        default {
            $response.error = @{ code = -32601; message = 'Method not found' }
        }
    }

    Write-JsonRpcResponse $response
}