# ADK-Go Integration - Phase 1 Blocker

## Issue
macOS permission issue preventing Go build operations:
```
go: creating work dir: mkdir /var/folders/dz/f4bh9z212q9d900q6k3t5lzh0000gn/T/go-build*: operation not permitted
```

## Impact
- Cannot run `make generate` to update CRD manifests
- Cannot run `go test` to verify unit tests
- Cannot run `go build` to compile the controller

## Root Cause
macOS security restrictions preventing Go from creating temporary build directories in `/var/folders`.

## Attempted Workarounds
1. ✗ `TMPDIR=/tmp make generate` - Failed
2. ✗ `GOCACHE=/tmp/go-cache` - Failed  
3. ✗ `GOTMPDIR=/tmp` - Failed
4. ✗ `go clean -cache` - Failed with same permission error

## Resolution Options

### Option 1: System Restart (Recommended)
Restart the Mac to clear any security restrictions on temp directories.

### Option 2: Reset Permissions
```bash
sudo chmod 1777 /var/folders
sudo chown root:wheel /var/folders
```

### Option 3: Full Disk Access
1. Open System Settings → Privacy & Security → Full Disk Access
2. Add Terminal.app (or your terminal emulator)
3. Restart terminal

### Option 4: Disable SIP (Not Recommended)
Only as last resort - disabling System Integrity Protection is a security risk.

## Verification
After applying a fix, verify with:
```bash
go version
go env GOTMPDIR
make generate
go test ./internal/adk/... -v
```

## Current Status
Phase 1 code is complete but untested due to this blocker:
- ✅ `internal/adk/runtime.go` - Core runtime implementation
- ✅ `internal/adk/runtime_test.go` - Unit tests (not run)
- ✅ `api/v1alpha1/agentcatalog_types.go` - CRD updates
- ✅ `config/samples/agentcatalog_adk_example.yaml` - Example manifest
- ⏸️ CRD manifest generation (blocked)
- ⏸️ Test execution (blocked)
