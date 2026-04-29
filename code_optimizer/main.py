from analyzer import CodeAnalyzer
from profiler import profile_code
from refactor import auto_refactor_code

# 示例代码进行分析
code = """
def foo():
    x = 0
    for i in range(1000000):
        x += i
    return x

def bar():
    x = 0
    for i in range(1000000):
        x += i
    return x
"""

analyzer = CodeAnalyzer(code)
analysis_results = analyzer.analyze_code()
print("Duplicates:", analysis_results['duplicates'])
print("Performance Issues:", analysis_results['performance_issues'])

# 输出优化建议
def generate_optimization_suggestions(analysis_results):
    suggestions = []
    
    # 如果有重复函数
    if analysis_results['duplicates']:
        for func, lines in analysis_results['duplicates']:
            suggestions.append(f"Optimization Suggestion: The function '{func}' is duplicated at lines {lines}. Consider refactoring.")
    
    # 如果发现性能问题
    if analysis_results['performance_issues']:
        for issue in analysis_results['performance_issues']:
            suggestions.append(issue)
    
    return suggestions

suggestions = generate_optimization_suggestions(analysis_results)
print("Optimization Suggestions:")
for suggestion in suggestions:
    print(suggestion)

# 自动修复后的代码
optimized_code = auto_refactor_code(code, analysis_results)
print("Optimized Code:")
print(optimized_code)

# 性能分析
profile_code()