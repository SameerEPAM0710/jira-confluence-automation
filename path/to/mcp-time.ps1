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
                serverInfo      = @{ name = 'time-windows'; version = '1.0.0' }
            }
        }
        'ping' {
            $response.result = @{}
        }
        'tools/list' {
            $response.result = @{
                tools = @(
                    @{
                        name        = 'get_time'
                        description = 'Get the current date and time in the local timezone or a specified Windows timezone.'
                        inputSchema = @{
                            type                 = 'object'
                            properties           = @{
                                timezone = @{
                                    type        = 'string'
                                    description = 'Optional timezone ID, such as UTC or India Standard Time. Defaults to the local timezone.'
                                }
                            }
                            additionalProperties = $false
                        }
                    }
                )
            }
        }
        'tools/call' {
            if ($request.params.name -ne 'get_time') {
                $response.error = @{ code = -32602; message = 'Unknown tool. Use get_time.' }
            }
            else {
                $timezoneId = [string]$request.params.arguments.timezone
                $timezoneError = $null

                if ([string]::IsNullOrWhiteSpace($timezoneId) -or $timezoneId -eq 'local') {
                    $timezone = [System.TimeZoneInfo]::Local
                }
                else {
                    try {
                        $timezone = [System.TimeZoneInfo]::FindSystemTimeZoneById($timezoneId)
                    }
                    catch {
                        $timezoneError = "Unknown timezone ID: $timezoneId"
                    }
                }

                if ($timezoneError) {
                    $response.result = New-ToolResult $timezoneError $true
                }
                else {
                    $now = [System.TimeZoneInfo]::ConvertTime([DateTimeOffset]::UtcNow, $timezone)
                    $formattedTime = $now.ToString('yyyy-MM-dd HH:mm:ss zzz', [System.Globalization.CultureInfo]::InvariantCulture)
                    $response.result = New-ToolResult "$formattedTime ($($timezone.Id))"
                }
            }
        }
        default {
            $response.error = @{ code = -32601; message = 'Method not found' }
        }
    }

    Write-JsonRpcResponse $response
}