# API Versioning Guide

## Overview

This document outlines the API versioning strategy for Luke Desktop, covering both internal APIs and MCP integration.

## Version Structure

### Semantic Versioning
```
MAJOR.MINOR.PATCH
 |     |     |
 |     |     +-- Bug fixes
 |     +-------- New features (backward compatible)
 +-------------- Breaking changes
```

### API Version Header
```typescript
const API_VERSION = {
  current: 'v1',
  supported: ['v1', 'v0.9'],
  deprecated: ['v0.8']
};
```

## Version Management

### API Endpoints
```typescript
// Example API route versioning
const API_ROUTES = {
  v1: {
    base: '/api/v1',
    mcp: '/api/v1/mcp',
    files: '/api/v1/files'
  }
};
```

### Version Compatibility

1. Version Check
   ```typescript
   function checkApiCompatibility(clientVersion: string): boolean {
     return API_VERSION.supported.includes(clientVersion);
   }
   ```

2. Version Mapping
   ```typescript
   const versionMap = {
     'v1': handleV1Request,
     'v0.9': handleLegacyRequest
   };
   ```

## MCP Version Integration

### Protocol Versioning
```typescript
interface MCPVersion {
  protocol: string;
  features: string[];
  deprecated?: string[];
}

const MCP_VERSIONS: Record<string, MCPVersion> = {
  'v1.0': {
    protocol: '1.0',
    features: ['basic-chat', 'file-attachment', 'streaming']
  },
  'v1.1': {
    protocol: '1.1',
    features: ['basic-chat', 'file-attachment', 'streaming', 'context-window']
  }
};
```

### Version Negotiation
```typescript
async function negotiateVersion(server: MCPServer): Promise<string> {
  const serverVersions = await server.getSupportedVersions();
  return findHighestCompatibleVersion(serverVersions, Object.keys(MCP_VERSIONS));
}
```

## Breaking Changes

### Handling Breaking Changes

1. Version Detection
   ```typescript
   function detectBreakingChanges(oldVersion: string, newVersion: string): string[] {
     return compareVersions(oldVersion, newVersion);
   }
   ```

2. Migration Support
   ```typescript
   async function migrateToVersion(targetVersion: string): Promise<void> {
     const migrations = getMigrationPath(currentVersion, targetVersion);
     for (const migration of migrations) {
       await executeMigration(migration);
     }
   }
   ```

### Deprecation Process

1. Marking Deprecation
   ```typescript
   function markDeprecated(version: string, feature: string): void {
     deprecationNotices.set(feature, {
       version,
       removalVersion: incrementVersion(version, 'MAJOR')
     });
   }
   ```

2. Deprecation Notices
   ```typescript
   function emitDeprecationWarning(feature: string): void {
     console.warn(`Feature "${feature}" is deprecated and will be removed in version ${removalVersion}`);
   }
   ```

## Version Documentation

### API Documentation
```typescript
interface APIEndpoint {
  version: string;
  path: string;
  method: string;
  deprecated?: boolean;
  replacedBy?: string;
}

const API_DOCUMENTATION: Record<string, APIEndpoint[]> = {
  'v1': [
    {
      version: 'v1',
      path: '/api/v1/mcp/connect',
      method: 'POST'
    }
  ]
};
```

### Changelog Management
```typescript
interface VersionChange {
  version: string;
  date: string;
  changes: {
    breaking: string[];
    features: string[];
    fixes: string[];
  };
}
```

## Testing

### Version Testing
```typescript
describe('API Versioning', () => {
  test('should handle version compatibility', () => {
    expect(checkApiCompatibility('v1')).toBe(true);
    expect(checkApiCompatibility('v0.8')).toBe(false);
  });
});
```

### Migration Testing
```typescript
describe('Version Migration', () => {
  test('should migrate data between versions', async () => {
    const result = await migrateToVersion('v1.1');
    expect(result.status).toBe('success');
  });
});
```

## Best Practices

### Version Implementation
1. Always include version in API routes
2. Maintain backward compatibility when possible
3. Document breaking changes
4. Provide migration paths
5. Test version compatibility

### Version Communication
1. Clear version documentation
2. Deprecation notices
3. Migration guides
4. Release notes
5. API changelog

## Error Handling

### Version Errors
```typescript
class VersionError extends Error {
  constructor(
    message: string,
    public readonly version: string,
    public readonly feature: string
  ) {
    super(message);
  }
}
```

### Error Responses
```typescript
interface VersionErrorResponse {
  error: string;
  currentVersion: string;
  requiredVersion: string;
  migrationPath?: string;
}
```

## Monitoring

### Version Usage
```typescript
interface VersionMetrics {
  version: string;
  usage: number;
  errors: number;
  deprecationHits: number;
}
```

### Version Analytics
```typescript
function trackVersionUsage(version: string, endpoint: string): void {
  analytics.track('api_usage', {
    version,
    endpoint,
    timestamp: new Date()
  });
}
```

## Future Considerations

### Version Planning
1. Feature roadmap
2. Deprecation schedule
3. Migration timeline
4. Documentation updates
5. Client communication

### Version Strategy
1. Long-term support versions
2. Version lifecycle
3. Update frequency
4. Breaking change policy
5. Client migration support