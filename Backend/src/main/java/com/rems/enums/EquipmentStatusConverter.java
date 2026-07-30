package com.rems.enums;

import jakarta.persistence.AttributeConverter;
import jakarta.persistence.Converter;

@Converter(autoApply = true)
public class EquipmentStatusConverter implements AttributeConverter<EquipmentStatus, String> {

    @Override
    public String convertToDatabaseColumn(EquipmentStatus attribute) {
        return attribute == null ? null : attribute.getValue();
    }

    @Override
    public EquipmentStatus convertToEntityAttribute(String dbData) {
        return dbData == null ? null : EquipmentStatus.fromValue(dbData);
    }
}
