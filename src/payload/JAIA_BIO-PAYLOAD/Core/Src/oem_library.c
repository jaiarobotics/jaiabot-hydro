#include "oem_library.h"

/* INITIALIZATION */
HAL_StatusTypeDef OEM_Init(OEM_CHIP *dev , I2C_HandleTypeDef *i2cHandle) {
    /* Init device params */
    dev->i2cHandle      = i2cHandle;
    dev->reading        = 0.0f;
    dev->devType        = 0x00;
    //dev->devAddr        = 0x00;

    /* Get device type */
    HAL_StatusTypeDef status = OEM_GetDeviceType(dev);
    if (dev->devType != EC_REG_DEV_TYPE && 
        dev->devType != PH_OEM_DEV_TYPE && 
        dev->devType != DO_OEM_DEV_TYPE) {
        return HAL_ERROR;
    } else if (status != HAL_OK) {
        return status;
    }

    // Activate OEM chip in order to begin taking readings.
    status = OEM_Activate(dev);

    return status;
}

HAL_StatusTypeDef OEM_Activate(OEM_CHIP *dev) {
    uint8_t activate_command = 0x01;
    return OEM_WriteRegister(dev, OEM_REG_ACTIVATE, &activate_command);
}

HAL_StatusTypeDef OEM_Hibernate(OEM_CHIP *dev) {
    uint8_t hibernate_command = 0x00;
    return OEM_WriteRegister(dev, OEM_REG_ACTIVATE, &hibernate_command);
}


/* COLLECT DATA */
HAL_StatusTypeDef OEM_GetDeviceType(OEM_CHIP *dev) {
    return OEM_ReadRegister(dev, OEM_REG_DEV_TYPE, &dev->devType);
}

HAL_StatusTypeDef OEM_ReadData(OEM_CHIP *dev) {
    uint8_t regData[4];
    float divFactor = 1;
    HAL_StatusTypeDef status = HAL_OK;

    switch (dev->devType) {
        case PH:
            status = OEM_ReadRegisters(dev, PH_OEM_REG_PH_MSB, &regData[0], 4);
            divFactor = 1000.0f;    // PH sensor datasheet calls for division of register value by 1000 while DO and EC call for 100.
            break;
        case DO:
            status = OEM_ReadRegisters(dev, DO_OEM_REG_DO_MSB, &regData[0], 4); 
            divFactor = 100.0f;
            break; 
        case EC:
            status = OEM_ReadRegisters(dev, EC_OEM_REG_EC_MSB, &regData[0], 4);
            divFactor = 100.0f;
            break;
        default:
            return HAL_ERROR;
    }

    uint32_t regReading = (regData[0] << 24) | (regData[1] << 16) | (regData[2] << 8) | regData[3];
    dev->reading = (float)regReading / divFactor;

    return status;
}



/* 
 * CALIBRATION DATA
 */

HAL_StatusTypeDef OEM_SetCalibration(OEM_CHIP *dev) {
    // return
}

HAL_StatusTypeDef OEM_GetCalibration(OEM_CHIP *dev) {
    // return
}


/* LOW-LEVEL FUNCTIONS */
HAL_StatusTypeDef OEM_ReadRegister(OEM_CHIP *dev, uint8_t reg, uint8_t *data) {
    return HAL_I2C_Mem_Read(dev->i2cHandle, dev->devAddr, reg, I2C_MEMADD_SIZE_8BIT, data, 1, HAL_MAX_DELAY);
}

HAL_StatusTypeDef OEM_ReadRegisters(OEM_CHIP *dev, uint8_t reg, uint8_t *data, uint8_t len) {
    return HAL_I2C_Mem_Read(dev->i2cHandle, dev->devAddr, reg, I2C_MEMADD_SIZE_8BIT, data, len, HAL_MAX_DELAY);
}

HAL_StatusTypeDef OEM_WriteRegister(OEM_CHIP *dev, uint8_t reg, uint8_t *data) {
    return HAL_I2C_Mem_Write(dev->i2cHandle, dev->devAddr, reg, I2C_MEMADD_SIZE_8BIT, data, 1, HAL_MAX_DELAY);
}


