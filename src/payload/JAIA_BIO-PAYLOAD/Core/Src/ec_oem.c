/*
 * ec_oem.c
 *
 *  Created on: Jan 23, 2025
 *      Author: nickmarshall
 */

/*
 * INCLUDES 
 */

#include "ec_oem.h" 


/* 
 * INITIALIZE 
 */ 

HAL_StatusTypeDef EC_OEM_Initialize( EC_OEM *dev, I2C_HandleTypeDef *i2cHandle ) {
	/* Set struct params */
	dev->i2cHandle	= i2cHandle;
	dev->ec_mS	 	= 0.0f;

	/* Number of transaction errors to be returned at end of function */
	uint8_t errNum = 0;
	HAL_StatusTypeDef status;

	/* Check device type */
	uint8_t regData;
	status = EC_OEM_ReadRegister( dev, EC_OEM_REG_DEV_TYPE, &regData );
	errNum += ( status != HAL_OK );

	if ( regData != EC_OEM_DEV_TYPE ) {
		return HAL_ERROR; 
	} else if ( status != HAL_OK ) {
		return status;
	}

	// Activate the EC chip to begin taking readings. Default of 1 reading every 640 ms.
	status = EC_OEM_Activate( dev );

	return status;
}


/*
 * DATA ACQUISITION
 */

HAL_StatusTypeDef EC_OEM_Activate( EC_OEM *dev ) {
	uint8_t activate_command = 0x01;
	return EC_OEM_WriteRegister( dev, EC_OEM_REG_ACTIVE, &activate_command );
}

HAL_StatusTypeDef EC_OEM_Hibernate( EC_OEM *dev ) {
	uint8_t hibernate_command = 0x00;
	return EC_OEM_WriteRegister( dev, EC_OEM_REG_ACTIVE, &hibernate_command );
}

HAL_StatusTypeDef EC_OEM_GetDevType( EC_OEM *dev ) {
	uint8_t deviceType;
	HAL_StatusTypeDef status = EC_OEM_ReadRegister( dev, EC_OEM_REG_DEV_TYPE, &deviceType );
	dev->devType = deviceType;

	return status;
}

HAL_StatusTypeDef EC_OEM_ReadEC( EC_OEM *dev ) {
	/* Read EC data from Atlas Scientific chip */	
	uint8_t regData[4];
	
	HAL_StatusTypeDef status = EC_OEM_ReadRegister( dev, EC_OEM_REG_EC_MSB, &regData[0] );
	status = EC_OEM_ReadRegister( dev, EC_OEM_REG_EC_LOW_BYTE, &regData[1] );
	status = EC_OEM_ReadRegister( dev, EC_OEM_REG_EC_HIGH_BYTE, &regData[2] );
	status = EC_OEM_ReadRegister( dev, EC_OEM_REG_EC_LSB, &regData[3] );

	/* Convert bytes to conductivity value */
	uint32_t ecRaw = (regData[0] << 24) | (regData[1] << 16) | (regData[2] << 8) | regData[3];
	//float ecRaw = 0;
	dev->ec_mS = (float)ecRaw / 100.0f;

	//HAL_StatusTypeDef status = HAL_OK;
	return status;
}

/*
 * LOW-LEVEL FUNCTIONS
 */

HAL_StatusTypeDef EC_OEM_ReadRegister( EC_OEM *dev, uint8_t reg, uint8_t *data ) {
	return HAL_I2C_Mem_Read( dev->i2cHandle, EC_OEM_I2C_ADDR, reg, I2C_MEMADD_SIZE_8BIT, data, 1, HAL_MAX_DELAY );
}

HAL_StatusTypeDef EC_OEM_ReadRegisters( EC_OEM *dev, uint8_t reg, uint8_t *data, uint8_t len ) {
	return HAL_I2C_Mem_Read( dev->i2cHandle, EC_OEM_I2C_ADDR, reg, I2C_MEMADD_SIZE_8BIT, data, len, HAL_MAX_DELAY );
}

HAL_StatusTypeDef EC_OEM_WriteRegister( EC_OEM *dev, uint8_t reg, uint8_t *data ) {
	return HAL_I2C_Mem_Write( dev->i2cHandle, EC_OEM_I2C_ADDR, reg, I2C_MEMADD_SIZE_8BIT, data, 1, HAL_MAX_DELAY );
}

