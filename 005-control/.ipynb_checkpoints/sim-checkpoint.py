from ipycanvas import Canvas

class Simulator:

    def __init__(self):
        canvas = Canvas(width=800, height=800, layout=dict(width="100%"))
        
        canvas

    def __del__(self):
        print("Out")
