import cProfile

def slow_function():
    total = 0
    for i in range(1000000):
        total += i
    return total

def fast_function():
    return sum(range(1000000))

# 使用 cProfile 来分析 slow_function 和 fast_function 的性能
def profile_code():
    print("Profiling slow_function:")
    cProfile.run('slow_function()')  # 测量慢的版本
    print("Profiling fast_function:")
    cProfile.run('fast_function()')  # 测量优化后的版本