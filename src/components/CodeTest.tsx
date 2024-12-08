import React, { useState } from 'react';
import { CodeBlock } from './Markdown';
import { themeOptions } from '@/lib/syntaxThemes';

const sampleCode = {
  javascript: `// Example JavaScript code
function fibonacci(n) {
  if (n <= 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

const result = fibonacci(10);
console.log(result);`,

  python: `# Example Python code
def quick_sort(arr):
    if len(arr) <= 1:
        return arr
    pivot = arr[len(arr) // 2]
    left = [x for x in arr if x < pivot]
    middle = [x for x in arr if x == pivot]
    right = [x for x in arr if x > pivot]
    return quick_sort(left) + middle + quick_sort(right)

numbers = [3, 6, 8, 10, 1, 2, 1]
sorted_numbers = quick_sort(numbers)
print(sorted_numbers)`,

  rust: `// Example Rust code
#[derive(Debug)]
struct Point {
    x: f64,
    y: f64,
}

impl Point {
    fn distance(&self, other: &Point) -> f64 {
        let dx = self.x - other.x;
        let dy = self.y - other.y;
        (dx * dx + dy * dy).sqrt()
    }
}

fn main() {
    let p1 = Point { x: 0.0, y: 0.0 };
    let p2 = Point { x: 5.0, y: 5.0 };
    println!("Distance: {}", p1.distance(&p2));
}`,

  sql: `-- Example SQL query
SELECT 
    departments.name AS department,
    COUNT(employees.id) AS employee_count,
    AVG(employees.salary) AS avg_salary
FROM departments
LEFT JOIN employees ON departments.id = employees.department_id
GROUP BY departments.id, departments.name
HAVING COUNT(employees.id) > 5
ORDER BY avg_salary DESC;`,

  html: `<!-- Example HTML -->
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Code Test</title>
    <style>
        .container {
            max-width: 800px;
            margin: 0 auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>Hello, World!</h1>
        <p>This is a test page.</p>
    </div>
</body>
</html>`,
};

const unlabeledCode = `
// This code has no explicit language marker
function processData(input) {
    const data = JSON.parse(input);
    return data.map(item => ({
        ...item,
        processed: true
    }));
}

const TestComponent = () => {
    const [state, setState] = useState(null);
    return <div>{JSON.stringify(state)}</div>;
};
`;

export default function CodeTest() {
  const [selectedExample, setSelectedExample] = useState<keyof typeof sampleCode>('javascript');

  return (
    <div className="p-6 space-y-6">
      <div className="space-y-2">
        <h2 className="text-xl font-semibold text-zinc-200">Code Highlighting Test</h2>
        <p className="text-sm text-zinc-400">
          Testing language detection and syntax highlighting with various code examples.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-2">
          {Object.keys(sampleCode).map((lang) => (
            <button
              key={lang}
              onClick={() => setSelectedExample(lang as keyof typeof sampleCode)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-colors ${
                selectedExample === lang
                  ? 'bg-blue-600 text-white'
                  : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
              }`}
            >
              {lang.charAt(0).toUpperCase() + lang.slice(1)}
            </button>
          ))}
        </div>

        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-medium text-zinc-300 mb-2">
              Example with Explicit Language
            </h3>
            <CodeBlock
              code={sampleCode[selectedExample]}
              language={selectedExample}
              showLineNumbers
            />
          </div>

          <div>
            <h3 className="text-lg font-medium text-zinc-300 mb-2">
              Example with Auto-Detection
            </h3>
            <CodeBlock
              code={unlabeledCode}
              showLineNumbers
            />
          </div>
        </div>
      </div>
    </div>
  );
}