# -*- coding: utf-8 -*-
import smbus
import sys
from time import sleep

def setup_st7032():
    trials = 5
    for i in range(trials):
        try:
            c_lower = (contrast & 0xf)
            c_upper = (contrast & 0x30)>>4
            bus.write_i2c_block_data(address_st7032, register_setting, [0x38, 0x39, 0x14, 0x70|c_lower, 0x54|c_upper, 0x6c])
            sleep(0.2)
            break
        except IOError:
            if i==trials-1:
                sys.exit()

def clear():
    global position
    global line
    position = 0
    line = 0
    bus.write_byte_data(address_st7032, register_setting, 0x01)
    sleep(0.1)

def newline():
    global position
    global line
    if line == display_lines-1:
        clear()
    else:
        line += 1
        position = chars_per_line*line
        bus.write_byte_data(address_st7032, 0xc0)
        sleep(0)

def write_string(s):
    for c in list(s):
        write_char(ord(c))

def write_char(c):
    global position
    byte_data = check_writable(c)
    if position == display_chars:
        clear()
    elif position == chars_per_line*(line+1):
        newline()
    bus.write_byte_data(address_st7032, register_display, byte_date)
    position += 1

def check_writable(c):
    if c >= 0x06 and c <= 0xff:
        return c
    else:
        return 0x20

bus = smbbus.SMBus(1)
address_st7032 = 0x3e
register_setting = 0x00
register_display = 0x40

contrast = 36
chars_per_line = 16
display_lines = 2

display_chars = chars_per_line*display_lines

position = 0
line = 0

setup_st7032()

if len(sys.argv)==1:
    write_string('Hello World')
    chr(0xb2)
    else:
        write_string(sys.argv[1])

