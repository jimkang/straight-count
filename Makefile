diagram:
	cat straight-count.dot | dot -Tsvg -v -o straight-count.svg

circo-diagram:
	env LD_LIBRARY_PATH=/usr/lib/graphviz && \
	cat straight-count.dot |circo -Tsvg -v -o straight-count.svg
