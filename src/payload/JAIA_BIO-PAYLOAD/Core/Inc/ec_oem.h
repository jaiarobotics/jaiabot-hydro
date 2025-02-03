/*
 * ec_oem.h
 *
 * Atlas Scientific OEM Electrical Conductivity chip I2C Driver
 *  Created on: Jan 23, 2025
 *      Author: nickmarshall
 */

#ifndef INC_EC_OEM_H_
#define INC_EC_OEM_H_
 
#include "stm32l4xx_hal.h" /* Needed for I2C */
#include "stdint.h"

#include <string.h>

/*
 * DEFINES
 */ 
#define EC_OEM_I2C_ADDR						(0x64 << 1)


/*
 * REGISTERS
 */

	/* DEVICE TYPE REGISTER */
#define EC_OEM_REG_DEV_TYPE					0x00
#define EC_OEM_DEV_TYPE 					0x04
 
	/* EC REGISTERS */
#define EC_OEM_REG_LED						0x05
#define EC_OEM_REG_ACTIVE					0x06	// send 0x01 to activate, 0x00 to hibernate
#define EC_OEM_REG_EC_MSB					0x18
#define EC_OEM_REG_EC_HIGH_BYTE				0x19
#define EC_OEM_REG_EC_LOW_BYTE				0x1A
#define EC_OEM_REG_EC_LSB					0x1B


/*
 * SENSOR STRUCT
 */
typedef struct {
	/* I2C handle */
	I2C_HandleTypeDef *i2cHandle;

	/* Electrical Conductivity */
	uint32_t ec_mS;

	/* Device type*/
	uint8_t devType;
} EC_OEM;


/*
 * INITIALIZATION
 */
HAL_StatusTypeDef EC_OEM_Initialize( EC_OEM *dev, I2C_HandleTypeDef *i2cHandle );


/*
 * DATA ACQUISITION
 */
HAL_StatusTypeDef EC_OEM_Activate( EC_OEM *dev );
HAL_StatusTypeDef EC_OEM_Hibernate( EC_OEM *dev );
HAL_StatusTypeDef EC_OEM_GetDevType( EC_OEM *dev );
HAL_StatusTypeDef EC_OEM_ReadEC( EC_OEM *dev );


/*
 * LOW-LEVEL FUNCTIONS
 */
HAL_StatusTypeDef EC_OEM_ReadRegister( EC_OEM *dev, uint8_t reg, uint8_t *data );
HAL_StatusTypeDef EC_OEM_ReadRegisters( EC_OEM *dev, uint8_t reg, uint8_t *data, uint8_t len );

HAL_StatusTypeDef EC_OEM_WriteRegister( EC_OEM *dev, uint8_t reg, uint8_t *data );

#endif /* INC_EC_OEM_H_ */
