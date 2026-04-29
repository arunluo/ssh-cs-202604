import ast

class CodeAnalyzer:
    def __init__(self, code):
        self.code = code
        self.tree = ast.parse(code)

    def find_duplicates(self):
        """查找重复的函数或代码块"""
        functions = {}
        duplicates = []
        
        for node in ast.walk(self.tree):
            if isinstance(node, ast.FunctionDef):
                func_name = node.name
                if func_name in functions:
                    functions[func_name].append(node.lineno)
                else:
                    functions[func_name] = [node.lineno]
        
        for func, lines in functions.items():
            if len(lines) > 1:
                duplicates.append((func, lines))
        
        return duplicates

    def find_performance_issues(self):
        """检测潜在的性能问题"""
        issues = []
        for node in ast.walk(self.tree):
            if isinstance(node, ast.For) or isinstance(node, ast.While):
                if isinstance(node.iter, ast.Call) and isinstance(node.iter.func, ast.Name) and node.iter.func.id == 'range':
                    # Range 可能导致性能问题，特别是在非常大的数字时
                    issues.append(f"Potential performance issue: Loop using range on line {node.lineno}")
        return issues

    def analyze_code(self):
        """分析代码并输出静态分析结果"""
        duplicates = self.find_duplicates()
        performance_issues = self.find_performance_issues()
        
        return {
            'duplicates': duplicates,
            'performance_issues': performance_issues
        }