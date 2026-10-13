$ErrorActionPreference = 'Stop'

function Write-JsonRpcResponse {
    param([hashtable]$Response)

    [Console]::Out.WriteLine(($Response | ConvertTo-Json -Compress -Depth 10))
}

function New-ToolResult {
    param(
        [string]$Text,
        [bool]$IsError = $false
    )

    return @{
        content = @(@{ type = 'text'; text = $Text })
        isError = $IsError
    }
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
                serverInfo      = @{ name = 'calculator-windows'; version = '1.0.0' }
            }
        }
        'ping' {
            $response.result = @{}
        }
        'tools/list' {
            $response.result = @{
                tools = @(
                    @{
                        name        = 'calculate'
                        description = 'Perform addition, subtraction, multiplication, or division on two numbers.'
                        inputSchema = @{
                            type                 = 'object'
                            properties           = @{
                                operation = @{
                                    type = 'string'
                                    enum = @('add', 'subtract', 'multiply', 'divide')
                                }
                                a = @{ type = 'number' }
                                b = @{ type = 'number' }
                            }
                            required             = @('operation', 'a', 'b')
                            additionalProperties = $false
                        }
                    }
                )
            }
        }
        'tools/call' {
            $arguments = $request.params.arguments
            $operation = [string]$arguments.operation
            $validOperations = @('add', 'subtract', 'multiply', 'divide')
            $a = $arguments.a
            $b = $arguments.b

            if ($request.params.name -ne 'calculate') {
                $response.error = @{ code = -32602; message = 'Unknown tool. Use calculate.' }
            }
            elseif ($operation -notin $validOperations) {
                $response.result = New-ToolResult 'operation must be add, subtract, multiply, or divide.' $true
            }
            elseif ($null -eq $a -or $null -eq $b -or $a -is [string] -or $b -is [string] -or $a -is [bool] -or $b -is [bool]) {
                $response.result = New-ToolResult 'a and b must be numbers.' $true
            }
            elseif ($operation -eq 'divide' -and [double]$b -eq 0) {
                $response.result = New-ToolResult 'Cannot divide by zero.' $true
            }
            else {
                $numberA = [double]$a
                $numberB = [double]$b
                switch ($operation) {
                    'add'      { $result = $numberA + $numberB }
                    'subtract' { $result = $numberA - $numberB }
                    'multiply' { $result = $numberA * $numberB }
                    'divide'   { $result = $numberA / $numberB }
                }
                $text = [string]::Format([System.Globalization.CultureInfo]::InvariantCulture, '{0}', $result)
                $response.result = New-ToolResult $text
            }
        }
        default {
            $response.error = @{ code = -32601; message = 'Method not found' }
        }
    }

    Write-JsonRpcResponse $response
}