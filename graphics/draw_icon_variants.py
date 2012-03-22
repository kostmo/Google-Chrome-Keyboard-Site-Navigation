#!/usr/bin/env python

from math import sqrt, pi
import cairo

image_side_pixel_count = 19
#image_side_pixel_count = 200
output_dir = "../extension/icons"

right_arrow_color = (0.2, 0.8, 0.5)
left_arrow_color = (0.9, 0.5, 0.2)
plus_sign_color = (0, 0, 0)
circle_color = (0.5, 0.2, 0.8)

def backward_arrow(ctx):
	ctx.set_source_rgb( *left_arrow_color ) # Solid color
	ctx.set_line_width(0.2)

	ctx.save()
	ctx.translate(0.6, 0.1)
	ctx.scale(0.8, 0.8)	# With 0.1 margins, we must subtract a total of 0.2 from the side length of the unit square

	ctx.translate(0, 0.5)

	ctx.scale(0.5, 0.5)

	ctx.translate(1/sqrt(2), 0)
	ctx.scale(-1, 1)

	unit_equilateral_triangle(ctx)
	ctx.restore()

def forward_arrow(ctx):
	# TODO Use a decorator to scale and translate appropriately
	ctx.set_line_width(0.2)
	ctx.set_source_rgb( *right_arrow_color ) # Solid color

	ctx.save()
	ctx.translate(0.6, 0.1)

	ctx.scale(0.8, 0.8)

	ctx.scale(0.5, 0.5)
	unit_equilateral_triangle(ctx)
	ctx.restore()

def unit_equilateral_triangle(ctx):
	'''Draw an right-pointing equilateral triangle in the unit square against the left edge.'''
	ctx.set_line_join(cairo.LINE_JOIN_ROUND)
	ctx.move_to(1/sqrt(2), 0.5)
	ctx.line_to (0, 0)
	ctx.line_to (0, 1)
	ctx.close_path ()
	ctx.stroke()

def unit_plus_sign(ctx):
	'''Draw a plus sign filling the unit square.'''
	ctx.rectangle(1/3.0, 0, 1/3.0, 1)
	ctx.rectangle(0, 1/3.0, 1, 1/3.0)
	ctx.fill()

def plus_sign(ctx):
	ctx.save()
	ctx.translate(0.1, 0.1)
	ctx.scale(0.3, 0.3)
	ctx.set_source_rgb( *plus_sign_color ) # Solid color
	unit_plus_sign(ctx)
	ctx.restore()

def unit_circle(ctx):
	ctx.arc(0, 0, 0.5, 0, 2*pi)

def circle(ctx):

	ctx.set_line_width(0.1/0.3)

	ctx.save()
	ctx.translate(0.25, 0.75)
	ctx.scale(0.3, 0.3)

	unit_circle(ctx)
	ctx.set_source_rgb( *circle_color ) # Solid color
	ctx.stroke()

	ctx.restore()

	question_mark(ctx)

def question_mark(ctx):

	qmark_character = "?"


	ctx.set_source_rgb(0.1, 0.1, 0.1)
#	ctx.select_font_face("Purisa", cairo.FONT_SLANT_NORMAL, cairo.FONT_WEIGHT_NORMAL)
	ctx.set_font_size(1)
	(x_bearing, y_bearing, width, height, x_advance, y_advance) = ctx.text_extents( qmark_character )

	print "Width:", width, "Height:", height
#	ctx.move_to(0.4, 1)
	target_scale = max(width, height)

	ctx.save()
	ctx.scale(1/target_scale, 1/target_scale)


	ctx.translate(((1 - width)/target_scale)/2, 0)

	ctx.show_text( qmark_character )

	ctx.restore()





keywords = {
	"guess": circle,
	"manual": plus_sign,
	"prev": backward_arrow,
	"next": forward_arrow,
}
sorted_keywords = sorted(keywords.keys())

def render_combination(ctx, combination):
	for element in combination:
		keywords[element](ctx)

def generate_combination( bits ):
	return [keyword for i, keyword in enumerate(sorted_keywords) if (bits >> i) & 1]

def write_combo_image(combo):

	import os
	filename_base = os.path.join(output_dir, "_".join(combo))
	filename = filename_base + ".png"

	surface = cairo.ImageSurface(cairo.FORMAT_ARGB32, image_side_pixel_count, image_side_pixel_count)
	ctx = cairo.Context(surface)
	ctx.scale(image_side_pixel_count, image_side_pixel_count)

	render_combination(ctx, combo)

	print "Writing png to path:", filename
	surface.write_to_png( filename )

if __name__ == "__main__":

	combinations = [generate_combination( i ) for i in range(2**len(keywords)) if i]
	print "Combinations:", combinations

	for combo in combinations:
		write_combo_image(combo)

