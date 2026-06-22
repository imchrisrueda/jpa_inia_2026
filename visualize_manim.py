from manim import *

class YOLOExplanation(Scene):
    def construct(self):
        # 1. Título e introducción
        title = Text("Explicación de Red Neuronal (YOLOv8)", font_size=36, color=GREEN)
        subtitle = Text("Diferenciación: Manzana (Cultivo) vs Banana (Maleza)", font_size=24, color=GRAY)
        subtitle.next_to(title, DOWN)
        
        self.play(Write(title), FadeIn(subtitle))
        self.wait(1.5)
        self.play(FadeOut(title), FadeOut(subtitle))
        
        # 2. Dibujar la estructura de la Red Neuronal
        # Definir capas de la red feedforward simple para ilustrar el concepto
        input_nodes_count = 4
        hidden_nodes_count = 3
        output_nodes_count = 2
        
        # Posicionamiento de las capas
        input_x = -4
        hidden_x = 0
        output_x = 4
        
        input_y_coords = np.linspace(2, -2, input_nodes_count)
        hidden_y_coords = np.linspace(1.5, -1.5, hidden_nodes_count)
        output_y_coords = np.linspace(1, -1, output_nodes_count)
        
        # Nombres de atributos
        input_labels_text = ["Color Rojo", "Color Amarillo", "Redondez", "Alargamiento"]
        output_labels_text = ["Cultivo (Manzana)", "Maleza (Banana)"]
        
        # Crear objetos visuales (círculos y textos)
        input_nodes = VGroup(*[Circle(radius=0.3, color=BLUE, fill_opacity=0.2) for _ in range(input_nodes_count)])
        hidden_nodes = VGroup(*[Circle(radius=0.3, color=GRAY, fill_opacity=0.2) for _ in range(hidden_nodes_count)])
        output_nodes = VGroup(*[Circle(radius=0.3, color=GRAY, fill_opacity=0.2) for _ in range(output_nodes_count)])
        
        # Posicionar nodos
        for node, y in zip(input_nodes, input_y_coords):
            node.move_to([input_x, y, 0])
            
        for node, y in zip(hidden_nodes, hidden_y_coords):
            node.move_to([hidden_x, y, 0])
            
        for node, y in zip(output_nodes, output_y_coords):
            node.move_to([output_x, y, 0])
            
        # Etiquetas de entrada y salida
        input_labels = VGroup()
        for node, text in zip(input_nodes, input_labels_text):
            label = Text(text, font_size=16).next_to(node, LEFT, buff=0.2)
            input_labels.add(label)
            
        output_labels = VGroup()
        for node, text in zip(output_nodes, output_labels_text):
            label = Text(text, font_size=16).next_to(node, RIGHT, buff=0.2)
            output_labels.add(label)
            
        # Dibujar nodos y etiquetas
        self.play(
            Create(input_nodes),
            Write(input_labels),
            run_time=1.5
        )
        self.play(Create(hidden_nodes), run_time=1)
        self.play(
            Create(output_nodes),
            Write(output_labels),
            run_time=1.2
        )
        self.wait(1)
        
        # 3. Dibujar las conexiones (sinapsis/edges)
        edges = VGroup()
        # Capa entrada -> Capa oculta
        for in_node in input_nodes:
            for hid_node in hidden_nodes:
                edge = Line(in_node.get_right(), hid_node.get_left(), stroke_width=1, color=GRAY_A, stroke_opacity=0.4)
                edges.add(edge)
                
        # Capa oculta -> Capa salida
        for hid_node in hidden_nodes:
            for out_node in output_nodes:
                edge = Line(hid_node.get_right(), out_node.get_left(), stroke_width=1, color=GRAY_A, stroke_opacity=0.4)
                edges.add(edge)
                
        self.play(Create(edges), run_time=2)
        self.wait(1)
        
        # 4. CASO 1: Procesando una MANZANA (CULTIVO)
        case1_title = Text("Caso 1: Procesando una Manzana", font_size=20, color=RED).to_edge(UP)
        self.play(Write(case1_title))
        
        # Activar entradas correctas para Manzana (Rojo e Redondez)
        # Nodos activos: 0 (Color Rojo) y 2 (Redondez)
        in_red = input_nodes[0]
        in_round = input_nodes[2]
        
        # Animación de iluminación en nodos activos de entrada
        self.play(
            in_red.animate.set_color(RED).set_fill(RED, fill_opacity=0.8),
            in_round.animate.set_color(RED).set_fill(RED, fill_opacity=0.8),
            run_time=1
        )
        self.wait(0.5)
        
        # Flujo de información (partículas / líneas brillantes) hacia capa oculta y salida
        active_edges_1 = VGroup(
            Line(in_red.get_right(), hidden_nodes[0].get_left(), color=RED, stroke_width=3),
            Line(in_round.get_right(), hidden_nodes[0].get_left(), color=RED, stroke_width=3),
            Line(in_red.get_right(), hidden_nodes[1].get_left(), color=RED, stroke_width=3),
            Line(in_round.get_right(), hidden_nodes[1].get_left(), color=RED, stroke_width=3),
        )
        
        self.play(Create(active_edges_1), run_time=1.5)
        self.play(
            hidden_nodes[0].animate.set_color(RED).set_fill(RED, fill_opacity=0.8),
            hidden_nodes[1].animate.set_color(RED).set_fill(RED, fill_opacity=0.8),
            run_time=1
        )
        
        # Propagación final al nodo de salida de Cultivo (Manzana)
        active_edges_2 = VGroup(
            Line(hidden_nodes[0].get_right(), output_nodes[0].get_left(), color=GREEN, stroke_width=4),
            Line(hidden_nodes[1].get_right(), output_nodes[0].get_left(), color=GREEN, stroke_width=4),
        )
        
        self.play(Create(active_edges_2), run_time=1.2)
        
        # El nodo del cultivo se ilumina en verde (INIA/Éxito)
        self.play(
            output_nodes[0].animate.set_color(GREEN).set_fill(GREEN, fill_opacity=0.8),
            run_time=1
        )
        
        # Dibujar una bounding box verde simulada alrededor del nombre
        bbox_manzana = Rectangle(width=4.5, height=1.2, color=GREEN, stroke_width=3).move_to(output_labels[0])
        bbox_tag = Text("MANZANA 98%", font_size=12, color=GREEN).next_to(bbox_manzana, UP, buff=0.1)
        self.play(Create(bbox_manzana), Write(bbox_tag))
        self.wait(2)
        
        # Limpieza de animaciones para el siguiente caso
        self.play(
            FadeOut(active_edges_1),
            FadeOut(active_edges_2),
            FadeOut(bbox_manzana),
            FadeOut(bbox_tag),
            FadeOut(case1_title),
            in_red.animate.set_color(BLUE).set_fill(BLUE, fill_opacity=0.2),
            in_round.animate.set_color(BLUE).set_fill(BLUE, fill_opacity=0.2),
            hidden_nodes[0].animate.set_color(GRAY).set_fill(GRAY, fill_opacity=0.2),
            hidden_nodes[1].animate.set_color(GRAY).set_fill(GRAY, fill_opacity=0.2),
            output_nodes[0].animate.set_color(GRAY).set_fill(GRAY, fill_opacity=0.2),
        )
        self.wait(0.5)
        
        # 5. CASO 2: Procesando una BANANA (MALEZA)
        case2_title = Text("Caso 2: Procesando una Banana (Maleza)", font_size=20, color=YELLOW).to_edge(UP)
        self.play(Write(case2_title))
        
        # Activar entradas correctas para Banana (Amarillo y Alargamiento)
        # Nodos activos: 1 (Color Amarillo) y 3 (Alargamiento)
        in_yellow = input_nodes[1]
        in_elong = input_nodes[3]
        
        self.play(
            in_yellow.animate.set_color(YELLOW).set_fill(YELLOW, fill_opacity=0.8),
            in_elong.animate.set_color(YELLOW).set_fill(YELLOW, fill_opacity=0.8),
            run_time=1
        )
        self.wait(0.5)
        
        # Flujo de información hacia capa oculta y salida (nodos inferiores y central)
        active_edges_3 = VGroup(
            Line(in_yellow.get_right(), hidden_nodes[1].get_left(), color=YELLOW, stroke_width=3),
            Line(in_elong.get_right(), hidden_nodes[1].get_left(), color=YELLOW, stroke_width=3),
            Line(in_yellow.get_right(), hidden_nodes[2].get_left(), color=YELLOW, stroke_width=3),
            Line(in_elong.get_right(), hidden_nodes[2].get_left(), color=YELLOW, stroke_width=3),
        )
        
        self.play(Create(active_edges_3), run_time=1.5)
        self.play(
            hidden_nodes[1].animate.set_color(YELLOW).set_fill(YELLOW, fill_opacity=0.8),
            hidden_nodes[2].animate.set_color(YELLOW).set_fill(YELLOW, fill_opacity=0.8),
            run_time=1
        )
        
        # Propagación final al nodo de salida de Maleza (Banana)
        active_edges_4 = VGroup(
            Line(hidden_nodes[1].get_right(), output_nodes[1].get_left(), color=RED, stroke_width=4),
            Line(hidden_nodes[2].get_right(), output_nodes[1].get_left(), color=RED, stroke_width=4),
        )
        
        self.play(Create(active_edges_4), run_time=1.2)
        
        # El nodo del plátano se ilumina en rojo (Maleza/Amenaza)
        self.play(
            output_nodes[1].animate.set_color(RED).set_fill(RED, fill_opacity=0.8),
            run_time=1
        )
        
        # Dibujar una bounding box roja simulada
        bbox_banana = Rectangle(width=4.5, height=1.2, color=RED, stroke_width=3).move_to(output_labels[1])
        bbox_tag_banana = Text("MALEZA 95%", font_size=12, color=RED).next_to(bbox_banana, UP, buff=0.1)
        self.play(Create(bbox_banana), Write(bbox_tag_banana))
        self.wait(2)
        
        # Finalización
        self.play(
            FadeOut(active_edges_3),
            FadeOut(active_edges_4),
            FadeOut(bbox_banana),
            FadeOut(bbox_tag_banana),
            FadeOut(case2_title),
            FadeOut(input_nodes),
            FadeOut(hidden_nodes),
            FadeOut(output_nodes),
            FadeOut(input_labels),
            FadeOut(output_labels),
            FadeOut(edges)
        )
        self.wait(1)
        
        end_text = Text("Simulación Finalizada", font_size=32, color=GREEN)
        self.play(Write(end_text))
        self.wait(1.5)
        self.play(FadeOut(end_text))
