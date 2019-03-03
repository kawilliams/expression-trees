from phylanx import Phylanx

@Phylanx(debug=True)
def factorial(n):
    result = 1
    if n > 1:
        result = n * factorial(n-1)
    return result

"""
define(factorial, n,
        block(
          define(result, 1),
            if(__gt(n, 1),
              store(result, 
                __mul(n, factorial(__sub(n, 1)))),
              block()
            ),
          result
        )
)
"""