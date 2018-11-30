
def convert(readfile, writefile):
	with open(readfile, "r") as f:
		file = f.readlines()
		print file[0].replace("\n",""), file[1].replace("\n",""), file[2].replace("\n","")
		for line in file:
			line = line.replace("\n", "")
			line = line.replace(" ", "")
			
		nl = "".join(file)
		f = open(writefile, "w")
		f.write(nl)
	return


def main():
	convert("factorial-perf.csv", "factorial-perf-nl.txt")

if __name__ == '__main__':
	main()
