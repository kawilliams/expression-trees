import send_data 

#@Phylanx(performance="x")
def fib(n):
    if n < 2:
        return n
    else:
        return fib(n-1)+fib(n-2)

k = fib(10)
print(k)
send_data.show_vis()
