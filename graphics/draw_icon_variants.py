#!/usr/bin/env python

import cairo
image_side_pixel_count = 19

def backward_arrow(ctx):
	ctx.set_source_rgb(0.9, 0.5, 0.2) # Solid color
	ctx.set_line_width(0.2)

	ctx.save()
	ctx.translate(0.1, 0.1)
	ctx.translate(0.5, 0)
	ctx.translate(0, 0.4)
	ctx.scale(-0.5, 0.4)
	draw_triangle(ctx)
	ctx.restore()

def forward_arrow(ctx):
	ctx.set_line_width(0.2)
	ctx.set_source_rgb(0.2, 0.8, 0.5) # Solid color

	ctx.save()
	ctx.translate(0.1, 0.1)
	ctx.scale(0.5, 0.4)
	draw_triangle(ctx)
	ctx.restore()

def draw_triangle(ctx):

	ctx.set_line_join(cairo.LINE_JOIN_ROUND)
	ctx.move_to(1, 0.5)
	ctx.line_to (0, 0)
	ctx.line_to (0, 1)
	ctx.close_path ()
	ctx.stroke()

def plus_sign(ctx):

	ctx.save()
	ctx.translate(0.7, 0.7)
	ctx.scale(0.3, 0.3)
	ctx.set_source_rgb(0, 0, 0) # Solid color
	ctx.rectangle(1/3.0, 0, 1/3.0, 1)
	ctx.rectangle(0, 1/3.0, 1, 1/3.0)
	ctx.fill()
	ctx.restore()

keywords = {
	"prev": backward_arrow,
	"next": forward_arrow,
	"manual": plus_sign
}

def render_combination(ctx, combination):
	for element in combination:
		keywords[element](ctx)

def generate_combination(i, j, k):
	combination = []
	if i:
		combination.append("manual")
	if j:
		combination.append("prev")
	if k:
		combination.append("next")
	combination.sort()
	return combination

if __name__ == "__main__":

	import os

	output_dir = "../extension/icons"
	'''
	if not os.path.exists(output_dir):
		os.mkdir(output_dir)
	'''
	combinations = []
	for i in range(2):
		for j in range(2):
			for k in range(2):
				if j or k:
					combinations.append(generate_combination(i, j, k))


	for combo in combinations:
		filename_base = os.path.join(output_dir, "_".join(combo))

		surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, image_side_pixel_count, image_side_pixel_count)
		ctx = cairo.Context(surface)
		ctx.scale(image_side_pixel_count, image_side_pixel_count)

		render_combination(ctx, combo)

		filename = filename_base + ".png"
		surface.write_to_png( filename )

