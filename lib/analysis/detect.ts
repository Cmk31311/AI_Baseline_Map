import { Language, ProjectManifest } from './baseline.types';

/**
 * Detect project languages and manifests from extracted files
 * @param files Array of extracted files
 * @returns Array of detected project manifests
 */
export function detectProjectManifests(files: { path?: string; name?: string; content: string }[]): ProjectManifest[] {
  const manifests: ProjectManifest[] = [];
  
  // Look for package.json (Node.js)
  const packageJson = files.find(f => (f.path || f.name)?.endsWith('package.json'));
  if (packageJson) {
    try {
      const pkg = JSON.parse(packageJson.content);
      manifests.push({
        language: 'node',
        file: packageJson.path || packageJson.name,
        dependencies: pkg.dependencies,
        devDependencies: pkg.devDependencies,
        peerDependencies: pkg.peerDependencies,
        optionalDependencies: pkg.optionalDependencies,
      });
    } catch (error) {
      console.warn(`Failed to parse package.json: ${error}`);
    }
  }
  
  // Look for requirements.txt (Python)
  const requirementsTxt = files.find(f => (f.path || f.name)?.endsWith('requirements.txt'));
  if (requirementsTxt) {
    manifests.push({
      language: 'python',
      file: requirementsTxt.path || requirementsTxt.name,
      dependencies: parseRequirementsTxt(requirementsTxt.content),
    });
  }
  
  // Look for pyproject.toml (Python)
  const pyprojectToml = files.find(f => (f.path || f.name)?.endsWith('pyproject.toml'));
  if (pyprojectToml) {
    try {
      const deps = parsePyprojectToml(pyprojectToml.content);
      if (deps) {
        manifests.push({
          language: 'python',
          file: pyprojectToml.path || pyprojectToml.name,
          dependencies: deps,
        });
      }
    } catch (error) {
      console.warn(`Failed to parse pyproject.toml: ${error}`);
    }
  }
  
  // Look for pom.xml (Java Maven)
  const pomXml = files.find(f => (f.path || f.name)?.endsWith('pom.xml'));
  if (pomXml) {
    try {
      const deps = parsePomXml(pomXml.content);
      if (deps) {
        manifests.push({
          language: 'java',
          file: pomXml.path || pomXml.name,
          dependencies: deps,
        });
      }
    } catch (error) {
      console.warn(`Failed to parse pom.xml: ${error}`);
    }
  }
  
  // Look for build.gradle (Java Gradle)
  const buildGradle = files.find(f => {
    const path = f.path || f.name;
    return path?.endsWith('build.gradle') || path?.endsWith('build.gradle.kts');
  });
  if (buildGradle) {
    try {
      const deps = parseBuildGradle(buildGradle.content);
      if (deps) {
        manifests.push({
          language: 'java',
          file: buildGradle.path || buildGradle.name,
          dependencies: deps,
        });
      }
    } catch (error) {
      console.warn(`Failed to parse build.gradle: ${error}`);
    }
  }
  
  // Look for go.mod (Go)
  const goMod = files.find(f => (f.path || f.name)?.endsWith('go.mod'));
  if (goMod) {
    try {
      const deps = parseGoMod(goMod.content);
      if (deps) {
        manifests.push({
          language: 'go',
          file: goMod.path || goMod.name,
          dependencies: deps,
        });
      }
    } catch (error) {
      console.warn(`Failed to parse go.mod: ${error}`);
    }
  }
  
  // Look for .csproj files (.NET)
  const csprojFiles = files.filter(f => (f.path || f.name)?.endsWith('.csproj'));
  for (const csproj of csprojFiles) {
    try {
      const deps = parseCsproj(csproj.content);
      if (deps) {
        manifests.push({
          language: 'dotnet',
          file: csproj.path || csproj.name,
          dependencies: deps,
        });
      }
    } catch (error) {
      console.warn(`Failed to parse ${csproj.path || csproj.name}: ${error}`);
    }
  }
  
  return manifests;
}

/**
 * Parse requirements.txt content
 * @param content requirements.txt content
 * @returns Dependencies object
 */
function parseRequirementsTxt(content: string): Record<string, string> {
  const deps: Record<string, string> = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    
    // Handle various requirement formats
    // package==1.0.0
    // package>=1.0.0
    // package~=1.0.0
    // package
    const match = trimmed.match(/^([a-zA-Z0-9_-]+)(.*)$/);
    if (match) {
      const [, name, version] = match;
      deps[name] = version || '*';
    }
  }
  
  return deps;
}

/**
 * Parse pyproject.toml content (basic parsing)
 * @param content pyproject.toml content
 * @returns Dependencies object or null
 */
function parsePyprojectToml(content: string): Record<string, string> | null {
  const deps: Record<string, string> = {};
  
  // Simple TOML parsing for dependencies
  const lines = content.split('\n');
  let inDependencies = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.startsWith('[tool.poetry.dependencies]') || 
        trimmed.startsWith('[project.dependencies]') ||
        trimmed.startsWith('[dependencies]')) {
      inDependencies = true;
      continue;
    }
    
    if (trimmed.startsWith('[') && inDependencies) {
      break;
    }
    
    if (inDependencies && trimmed && !trimmed.startsWith('#')) {
      const match = trimmed.match(/^([a-zA-Z0-9_-]+)\s*=\s*["']?([^"']+)["']?/);
      if (match) {
        const [, name, version] = match;
        deps[name] = version;
      }
    }
  }
  
  return Object.keys(deps).length > 0 ? deps : null;
}

/**
 * Parse pom.xml content (basic XML parsing)
 * @param content pom.xml content
 * @returns Dependencies object or null
 */
function parsePomXml(content: string): Record<string, string> | null {
  const deps: Record<string, string> = {};
  
  // Simple XML parsing for dependencies
  const dependencyRegex = /<dependency>\s*<groupId>([^<]+)<\/groupId>\s*<artifactId>([^<]+)<\/artifactId>\s*<version>([^<]+)<\/version>/g;
  let match;
  
  while ((match = dependencyRegex.exec(content)) !== null) {
    const [, groupId, artifactId, version] = match;
    const fullName = `${groupId}:${artifactId}`;
    deps[fullName] = version;
  }
  
  return Object.keys(deps).length > 0 ? deps : null;
}

/**
 * Parse build.gradle content (basic parsing)
 * @param content build.gradle content
 * @returns Dependencies object or null
 */
function parseBuildGradle(content: string): Record<string, string> | null {
  const deps: Record<string, string> = {};
  
  // Simple Gradle parsing for dependencies
  const lines = content.split('\n');
  let inDependencies = false;
  
  for (const line of lines) {
    const trimmed = line.trim();
    
    if (trimmed.includes('dependencies') && trimmed.includes('{')) {
      inDependencies = true;
      continue;
    }
    
    if (trimmed === '}' && inDependencies) {
      break;
    }
    
    if (inDependencies && trimmed.includes('implementation') || trimmed.includes('compile')) {
      // implementation 'group:artifact:version'
      // implementation("group:artifact:version")
      const match = trimmed.match(/(?:implementation|compile)\s*[("]?([^:)]+):([^:)]+):([^:)]+)/);
      if (match) {
        const [, group, artifact, version] = match;
        const fullName = `${group}:${artifact}`;
        deps[fullName] = version;
      }
    }
  }
  
  return Object.keys(deps).length > 0 ? deps : null;
}

/**
 * Parse go.mod content
 * @param content go.mod content
 * @returns Dependencies object or null
 */
function parseGoMod(content: string): Record<string, string> | null {
  const deps: Record<string, string> = {};
  const lines = content.split('\n');
  
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('require')) {
      // require (
      //   module v1.0.0
      // )
      continue;
    }
    
    if (trimmed.startsWith('require ')) {
      // require module v1.0.0
      const match = trimmed.match(/require\s+([^\s]+)\s+([^\s]+)/);
      if (match) {
        const [, module, version] = match;
        deps[module] = version;
      }
    } else if (trimmed && !trimmed.startsWith('go ') && !trimmed.startsWith('module ') && !trimmed.startsWith('//')) {
      // Module version line
      const match = trimmed.match(/^([^\s]+)\s+([^\s]+)/);
      if (match) {
        const [, module, version] = match;
        deps[module] = version;
      }
    }
  }
  
  return Object.keys(deps).length > 0 ? deps : null;
}

/**
 * Parse .csproj content (basic XML parsing)
 * @param content .csproj content
 * @returns Dependencies object or null
 */
function parseCsproj(content: string): Record<string, string> | null {
  const deps: Record<string, string> = {};
  
  // Simple XML parsing for PackageReference
  const packageRefRegex = /<PackageReference\s+Include="([^"]+)"\s+Version="([^"]+)"\s*\/?>/g;
  let match;
  
  while ((match = packageRefRegex.exec(content)) !== null) {
    const [, packageName, version] = match;
    deps[packageName] = version;
  }
  
  return Object.keys(deps).length > 0 ? deps : null;
}

/**
 * Detect languages from file extensions
 * @param files Array of extracted files
 * @returns Array of detected languages
 */
export function detectLanguagesFromFiles(files: { path?: string; name?: string }[]): Language[] {
  const languageMap: Record<string, Language> = {
    '.js': 'node',
    '.jsx': 'node',
    '.ts': 'node',
    '.tsx': 'node',
    '.py': 'python',
    '.java': 'java',
    '.go': 'go',
    '.cs': 'dotnet',
    '.fs': 'dotnet',
    '.vb': 'dotnet',
  };
  
  const detectedLanguages = new Set<Language>();
  
  for (const file of files) {
    const filePath = file.path || file.name;
    if (filePath) {
      const ext = getFileExtension(filePath);
      const language = languageMap[ext];
      if (language) {
        detectedLanguages.add(language);
      }
    }
  }
  
  return Array.from(detectedLanguages);
}

/**
 * Get file extension from path
 * @param filePath File path
 * @returns File extension with dot
 */
function getFileExtension(filePath: string): string {
  const lastDot = filePath.lastIndexOf('.');
  if (lastDot === -1) return '';
  return filePath.substring(lastDot);
}

/**
 * Get primary language from manifests
 * @param manifests Array of project manifests
 * @returns Primary language or null
 */
export function getPrimaryLanguage(manifests: ProjectManifest[]): Language | null {
  if (manifests.length === 0) return null;
  
  // Priority order: node, python, java, go, dotnet
  const priority: Language[] = ['node', 'python', 'java', 'go', 'dotnet'];
  
  for (const lang of priority) {
    if (manifests.some(m => m.language === lang)) {
      return lang;
    }
  }
  
  return manifests[0].language;
}

/**
 * Check if a file is a manifest file
 * @param filePath File path
 * @returns True if it's a manifest file
 */
export function isManifestFile(filePath: string): boolean {
  const manifestFiles = [
    'package.json',
    'requirements.txt',
    'pyproject.toml',
    'pom.xml',
    'build.gradle',
    'build.gradle.kts',
    'go.mod',
    '.csproj',
  ];
  
  return manifestFiles.some(manifest => filePath.endsWith(manifest));
}

/**
 * Get manifest file type from path
 * @param filePath File path
 * @returns Manifest type or null
 */
export function getManifestType(filePath: string): { language: Language; type: string } | null {
  if (filePath.endsWith('package.json')) {
    return { language: 'node', type: 'package.json' };
  }
  if (filePath.endsWith('requirements.txt')) {
    return { language: 'python', type: 'requirements.txt' };
  }
  if (filePath.endsWith('pyproject.toml')) {
    return { language: 'python', type: 'pyproject.toml' };
  }
  if (filePath.endsWith('pom.xml')) {
    return { language: 'java', type: 'pom.xml' };
  }
  if (filePath.endsWith('build.gradle') || filePath.endsWith('build.gradle.kts')) {
    return { language: 'java', type: 'build.gradle' };
  }
  if (filePath.endsWith('go.mod')) {
    return { language: 'go', type: 'go.mod' };
  }
  if (filePath.endsWith('.csproj')) {
    return { language: 'dotnet', type: '.csproj' };
  }
  
  return null;
}
